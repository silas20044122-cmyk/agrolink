import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Interface defining the profile storage operations.
 */
export interface UserProfileRepository {
  getProfile(email: string): Promise<UserProfile | null>;
  updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  uploadAvatar(file: File, userId: string): Promise<string>;
}

/**
 * Production implementation using Supabase (PostgreSQL & Storage buckets).
 */
export class SupabaseProfileRepository implements UserProfileRepository {
  async getProfile(email: string): Promise<UserProfile | null> {
    try {
      // First, find user by email to get user ID
      // If we are currently logged in via Supabase, we can fetch by id or session,
      // but to support cross-device email search:
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return null;
      }

      const { data: dbProfile, error: dbError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (dbError) {
        console.error('Error fetching Supabase profile:', dbError);
        throw dbError;
      }

      if (!dbProfile) {
        return null;
      }

      return {
        id: dbProfile.id,
        name: dbProfile.displayName || session.user.user_metadata.full_name || email.split('@')[0],
        email: email,
        role: session.user.user_metadata.role || 'farmer',
        region: dbProfile.location || 'Kakamega',
        avatarUrl: dbProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbProfile.id}`,
        phoneNumber: dbProfile.phoneNumber || session.user.user_metadata.phoneNumber || '',
        bio: dbProfile.bio || ''
      };
    } catch (err) {
      console.error('Failed to retrieve profile from Supabase:', err);
      throw err;
    }
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Sync metadata in Auth first
      await supabase.auth.updateUser({
        data: {
          phoneNumber: updates.phoneNumber,
          region: updates.region,
          full_name: updates.name
        }
      });

      // Sync with farmer_profiles table
      const { data: dbProfile, error } = await supabase
        .from('farmer_profiles')
        .upsert({
          id: id,
          displayName: updates.name,
          avatarUrl: updates.avatarUrl,
          location: updates.region,
          bio: updates.bio || '',
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: id,
        name: dbProfile.displayName || updates.name || '',
        email: session.user.email || '',
        role: updates.role || 'farmer',
        region: dbProfile.location || updates.region || '',
        avatarUrl: dbProfile.avatarUrl || updates.avatarUrl || '',
        phoneNumber: updates.phoneNumber || '',
        bio: dbProfile.bio || ''
      };
    } catch (err) {
      console.error('Failed to update Supabase profile:', err);
      throw err;
    }
  }

  async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Append cache buster to bypass caching on subsequent updates
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
      return cacheBustedUrl;
    } catch (err) {
      console.error('Failed to upload avatar to Supabase:', err);
      throw err;
    }
  }
}

/**
 * Custom Express API implementation serving as the single source of truth
 * for our full-stack container deployment when Supabase is not active.
 */
export class ApiProfileRepository implements UserProfileRepository {
  async getProfile(email: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`/api/profile?email=${encodeURIComponent(email.toLowerCase().trim())}`);
      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.profile) {
        return data.profile;
      }
      return null;
    } catch (err) {
      console.error('Failed to retrieve profile from API:', err);
      throw err;
    }
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Fetch latest existing profile first to ensure deep merge
      const existing = await this.getProfile(updates.email || '');
      const mergedProfile = {
        id,
        name: updates.name ?? existing?.name ?? '',
        email: (updates.email ?? existing?.email ?? '').toLowerCase().trim(),
        role: updates.role ?? existing?.role ?? 'farmer',
        region: updates.region ?? existing?.region ?? 'Kakamega',
        avatarUrl: updates.avatarUrl ?? existing?.avatarUrl ?? '',
        phoneNumber: updates.phoneNumber ?? existing?.phoneNumber ?? '',
        bio: updates.bio ?? existing?.bio ?? ''
      };

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: mergedProfile })
      });

      if (!response.ok) {
        throw new Error(`Profile update failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.profile) {
        return data.profile;
      }
      throw new Error('API did not return updated profile object');
    } catch (err) {
      console.error('Failed to update profile via API:', err);
      throw err;
    }
  }

  async uploadAvatar(file: File, userId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        try {
          const response = await fetch('/api/settings/upload-profile-picture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64String, userId })
          });

          if (!response.ok) {
            throw new Error(`Avatar upload API failed: ${response.statusText}`);
          }

          const data = await response.json();
          if (data.success && data.avatarUrl) {
            // Include cache busting timestamp
            const cacheBustedUrl = `${data.avatarUrl}${data.avatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
            resolve(cacheBustedUrl);
          } else {
            throw new Error(data.message || 'Server failed to save avatar');
          }
        } catch (err: any) {
          console.error('Avatar API upload error:', err);
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read binary image file'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Profile service that dynamically chooses the correct repository layer
 * based on environment state.
 */
export class ProfileService {
  private static repository: UserProfileRepository = isSupabaseConfigured
    ? new SupabaseProfileRepository()
    : new ApiProfileRepository();

  static async getProfile(email: string): Promise<UserProfile | null> {
    return this.repository.getProfile(email);
  }

  static async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.repository.updateProfile(id, updates);
  }

  static async uploadAvatar(file: File, userId: string): Promise<string> {
    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file format. Only JPEG, PNG, or SVG image files are allowed.');
    }
    // Validate size limit (5MB as per backend specification)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File is too large. Maximum allowable size is 5MB.');
    }
    return this.repository.uploadAvatar(file, userId);
  }
}
