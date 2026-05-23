import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FarmerProfile {
  id: string;
  displayName: string;
  avatarUrl: string;
  location: string;
  farmingInterests: string[];
  cropsGrown: string[];
  reputationScore: number;
  contributionsCount: number;
  bio: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  isTrending: boolean;
  createdAt: string;
  author?: FarmerProfile;
  isLiked?: boolean;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: FarmerProfile;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  activeUsers: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author?: FarmerProfile;
  replyTo?: {
    id: string;
    authorName: string;
    content: string;
  };
}

// === SYSTEM SEED DATA FOR BACKWARD-COMPATIBLE FALLBACKS ===
const DEFAULT_ROOMS: ChatRoom[] = [
  { id: 'general', name: 'General Farming', description: 'Discuss anything related to farming', icon: '🌾', category: 'General', activeUsers: 12 },
  { id: 'maize', name: 'Maize Growers', description: 'Maize-specific challenges', icon: '🌽', category: 'Crops', activeUsers: 8 },
  { id: 'livestock', name: 'Livestock & Poultry', description: 'Animal health and dairy', icon: '🐄', category: 'Livestock', activeUsers: 5 },
  { id: 'market', name: 'Market Hub', description: 'Real-time price updates', icon: '📈', category: 'Market', activeUsers: 15 },
  { id: 'pests', name: 'Pest & Disease Support', description: 'AI-assisted diagnosis and peer help', icon: '🔍', category: 'Support', activeUsers: 24 }
];

const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    authorId: "00000000-0000-0000-0000-000000000001",
    content: "Has anyone seen Fall Armyworm in Eldoret this week? Seeing some suspicious holes in my maize leaves.",
    category: "Crop Diseases",
    likesCount: 12,
    commentsCount: 3,
    isTrending: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    author: { id: "00000000-0000-0000-0000-000000000001", displayName: "David K.", avatarUrl: "👨‍🌾", location: "Eldoret", farmingInterests: [], cropsGrown: [], reputationScore: 2500, contributionsCount: 42, bio: "" }
  },
  {
    id: "post-2",
    authorId: "00000000-0000-0000-0000-000000000002",
    content: "Tomato prices are peaking at Nairobi Market (Wakulima). KES 4500 per crate today!",
    category: "Market Trends",
    likesCount: 45,
    commentsCount: 1,
    isTrending: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    author: { id: "00000000-0000-0000-0000-000000000002", displayName: "Sarah M.", avatarUrl: "👩‍🌾", location: "Nairobi", farmingInterests: [], cropsGrown: [], reputationScore: 1800, contributionsCount: 29, bio: "" }
  },
  {
    id: "post-3",
    authorId: "00000000-0000-0000-0000-000000000003",
    content: "Best fertilizer for late-stage maize in Kakamega? Thinking of using CAN but open to suggestions.",
    category: "Fertilizers",
    likesCount: 24,
    commentsCount: 2,
    isTrending: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    author: { id: "00000000-0000-0000-0000-000000000003", displayName: "Peter O.", avatarUrl: "🚜", location: "Kakamega", farmingInterests: [], cropsGrown: [], reputationScore: 1200, contributionsCount: 15, bio: "" }
  }
];

const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  general: [
    {
      id: 'm-g1',
      roomId: 'general',
      authorId: '00000000-0000-0000-0000-000000000001',
      content: 'Habari farmers! How is the maize planting progressing in your regions?',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000001', displayName: 'David K.', avatarUrl: '👨‍🌾', location: 'Eldoret', farmingInterests: [], cropsGrown: [], reputationScore: 2500, contributionsCount: 42, bio: '' }
    },
    {
      id: 'm-g2',
      roomId: 'general',
      authorId: '00000000-0000-0000-0000-000000000002',
      content: 'Kiambu received heavy rains yesterday night. Good time to get top dressing fertilizer ready!',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000002', displayName: 'Sarah M.', avatarUrl: '👩‍🌾', location: 'Nairobi', farmingInterests: [], cropsGrown: [], reputationScore: 1800, contributionsCount: 29, bio: '' }
    },
    {
      id: 'm-g3',
      roomId: 'general',
      authorId: '00000000-0000-0000-0000-000000000003',
      content: 'True, also make sure we weed early so the weeds do not compete with our maize seedlings.',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000003', displayName: 'Peter O.', avatarUrl: '🚜', location: 'Kakamega', farmingInterests: [], cropsGrown: [], reputationScore: 1200, contributionsCount: 15, bio: '' }
    }
  ],
  maize: [
    {
      id: 'm-m1',
      roomId: 'maize',
      authorId: '00000000-0000-0000-0000-000000000001',
      content: 'Does anyone recommend H614 or H624 varieties for the upcoming short rains in Western Kenya?',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000001', displayName: 'David K.', avatarUrl: '👨‍🌾', location: 'Eldoret', farmingInterests: [], cropsGrown: [], reputationScore: 2500, contributionsCount: 42, bio: '' }
    },
    {
      id: 'm-m2',
      roomId: 'maize',
      authorId: '00000000-0000-0000-0000-000000000003',
      content: 'H614 does really well in Kakamega if the rain is steady. High yield potential!',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000003', displayName: 'Peter O.', avatarUrl: '🚜', location: 'Kakamega', farmingInterests: [], cropsGrown: [], reputationScore: 1200, contributionsCount: 15, bio: '' }
    }
  ],
  pests: [
    {
      id: 'm-p1',
      roomId: 'pests',
      authorId: '00000000-0000-0000-0000-000000000003',
      content: 'Help! My kale leaves are turning yellow and have small black spots. What could this be?',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000003', displayName: 'Peter O.', avatarUrl: '🚜', location: 'Kakamega', farmingInterests: [], cropsGrown: [], reputationScore: 1200, contributionsCount: 15, bio: '' }
    },
    {
      id: 'm-p2',
      roomId: 'pests',
      authorId: '00000000-0000-0000-0000-000000000001',
      content: 'That sounds like Black Rot or Downy Mildew. Remove infected leaves immediately, and try spraying copper fungicide or a baking soda solution.',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000001', displayName: 'David K.', avatarUrl: '👨‍🌾', location: 'Eldoret', farmingInterests: [], cropsGrown: [], reputationScore: 2500, contributionsCount: 42, bio: '' }
    }
  ],
  market: [
    {
      id: 'm-mk1',
      roomId: 'market',
      authorId: '00000000-0000-0000-0000-000000000002',
      content: 'Nairobi Wakulima market has high demand for cabbages this week. Prices peaking at KES 80 per head.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000002', displayName: 'Sarah M.', avatarUrl: '👩‍🌾', location: 'Nairobi', farmingInterests: [], cropsGrown: [], reputationScore: 1800, contributionsCount: 29, bio: '' }
    }
  ],
  livestock: [
    {
      id: 'm-l1',
      roomId: 'livestock',
      authorId: '00000000-0000-0000-0000-000000000003',
      content: 'My dairy cow milk yields dropped slightly after changing silage. Any dairy concentrates recommended?',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      author: { id: '00000000-0000-0000-0000-000000000003', displayName: 'Peter O.', avatarUrl: '🚜', location: 'Kakamega', farmingInterests: [], cropsGrown: [], reputationScore: 1200, contributionsCount: 15, bio: '' }
    }
  ]
};

const DEFAULT_COMMENTS: Record<string, CommunityComment[]> = {
  "post-1": [
    { id: "c-1", postId: "post-1", authorId: "00000000-0000-0000-0000-000000000002", content: "Yes, I saw it in my neighbor's plot. We solved it with early spraying.", createdAt: new Date().toISOString(), author: { id: "00000000-0000-0000-0000-000000000002", displayName: "Sarah M.", avatarUrl: "👩‍🌾", location: "Nairobi", farmingInterests: [], cropsGrown: [], reputationScore: 1800, contributionsCount: 29, bio: "" } }
  ]
};

export function getRealMemberCount(roomId: string, currentUserId: string | undefined): number {
  const defaultMsgs = DEFAULT_MESSAGES[roomId] || [];
  
  // Get from local storage
  let localMessages: ChatMessage[] = [];
  try {
    localMessages = JSON.parse(localStorage.getItem(`agrolink_chat_messages_${roomId}`) || '[]');
  } catch (e) {
    // ignore
  }

  // Set of unique authorIds
  const uniqueAuthors = new Set<string>();
  
  // Add authors from default messages
  defaultMsgs.forEach(m => {
    if (m.authorId) uniqueAuthors.add(m.authorId);
  });
  
  // Add authors from local messages
  localMessages.forEach(m => {
    if (m.authorId) uniqueAuthors.add(m.authorId);
  });

  // Also, check if user has ever clicked "Join Chat" on this room. We can track this in localStorage
  let joinedRoomIds: string[] = [];
  try {
    joinedRoomIds = JSON.parse(localStorage.getItem('agrolink_joined_rooms') || '[]');
  } catch (e) {}

  if (joinedRoomIds.includes(roomId) && currentUserId) {
    uniqueAuthors.add(currentUserId);
  }

  return Math.max(uniqueAuthors.size, 1);
}

export function useCommunity(userId: string | undefined) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (category?: string) => {
    setLoading(true);
    
    // Check if localStorage has community posts
    const localPostsKey = 'agrolink_community_posts';
    let localPosts: CommunityPost[] = [];
    try {
      localPosts = JSON.parse(localStorage.getItem(localPostsKey) || '[]');
    } catch (e) {
      console.error(e);
    }

    let deletedPostIds: string[] = [];
    try {
      deletedPostIds = JSON.parse(localStorage.getItem('agrolink_deleted_post_ids') || '[]');
    } catch (e) {}

    if (!isSupabaseConfigured) {
      // Offline/Mock mode
      let filteredPosts = [...localPosts, ...DEFAULT_POSTS];
      filteredPosts = filteredPosts.filter(p => !deletedPostIds.includes(p.id));
      if (category && category !== 'All') {
        filteredPosts = filteredPosts.filter(p => p.category === category);
      }
      setPosts(filteredPosts);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('community_posts')
        .select('*, author:farmer_profiles(*)')
        .order('createdAt', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data: postsData, error: postsError } = await query;
      if (!postsError && postsData) {
        // Merge with local storage created posts that are not in database yet
        let merged = [...localPosts.filter(lp => !postsData.some(p => p.id === lp.id)), ...postsData];
        merged = merged.filter(p => !deletedPostIds.includes(p.id));
        
        if (userId) {
          // Fetch likes for these posts by current user
          const postIds = merged.map(p => p.id);
          const { data: likesData } = await supabase
            .from('community_post_likes')
            .select('postId')
            .eq('authorId', userId)
            .in('postId', postIds);
          
          const likedPostIds = new Set(likesData?.map(l => l.postId) || []);
          const postsWithLikes = merged.map(p => ({
            ...p,
            isLiked: likedPostIds.has(p.id)
          }));
          setPosts(postsWithLikes);
        } else {
          setPosts(merged);
        }
      } else {
        // fallback
        let filteredPosts = [...localPosts, ...DEFAULT_POSTS];
        filteredPosts = filteredPosts.filter(p => !deletedPostIds.includes(p.id));
        if (category && category !== 'All') {
          filteredPosts = filteredPosts.filter(p => p.category === category);
        }
        setPosts(filteredPosts);
      }
    } catch (err) {
      console.error('Error fetching community posts, falling back:', err);
      let filteredPosts = [...localPosts, ...DEFAULT_POSTS];
      filteredPosts = filteredPosts.filter(p => !deletedPostIds.includes(p.id));
      if (category && category !== 'All') {
        filteredPosts = filteredPosts.filter(p => p.category === category);
      }
      setPosts(filteredPosts);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchRooms = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const mappedDefault = DEFAULT_ROOMS.map(room => ({
        ...room,
        activeUsers: getRealMemberCount(room.id, userId)
      }));
      setRooms(mappedDefault);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('category', { ascending: true });
      
      let roomsList = data && data.length > 0 ? data : DEFAULT_ROOMS;

      // Query database to retrieve real unique participant counts
      const { data: messagesData, error: msgError } = await supabase
        .from('chat_messages')
        .select('roomId, authorId');

      if (!msgError && messagesData) {
        // Group by roomId and construct unique author lists
        const counts: Record<string, Set<string>> = {};
        messagesData.forEach(msg => {
          if (!counts[msg.roomId]) counts[msg.roomId] = new Set();
          counts[msg.roomId].add(msg.authorId);
        });

        // Also merge with locally joined rooms
        let joinedRoomIds: string[] = [];
        try {
          joinedRoomIds = JSON.parse(localStorage.getItem('agrolink_joined_rooms') || '[]');
        } catch (e) {}

        roomsList = roomsList.map(room => {
          const authorSet = counts[room.id] || new Set();
          // Seed standard message authors
          const defaultMsgs = DEFAULT_MESSAGES[room.id] || [];
          defaultMsgs.forEach(m => authorSet.add(m.authorId));
          
          if (joinedRoomIds.includes(room.id) && userId) {
            authorSet.add(userId);
          }
          return {
            ...room,
            activeUsers: Math.max(authorSet.size, 1)
          };
        });
      } else {
        roomsList = roomsList.map(room => ({
          ...room,
          activeUsers: getRealMemberCount(room.id, userId)
        }));
      }

      setRooms(roomsList);
    } catch (err) {
      console.error('Error fetching chat rooms, falling back:', err);
      setRooms(DEFAULT_ROOMS.map(room => ({
        ...room,
        activeUsers: getRealMemberCount(room.id, userId)
      })));
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts();
    fetchRooms();

    if (!isSupabaseConfigured) return;

    // Subscribe to post inserts and deletes
    const channelName = `community-posts-${Math.random().toString(36).substring(7)}`;
    const postSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          return;
        }
        if (payload.eventType !== 'INSERT') return;
        try {
          const { data: authorData } = await supabase
            .from('farmer_profiles')
            .select('*')
            .eq('id', payload.new.authorId)
            .single();
          
          const newPost = { ...payload.new, author: authorData } as CommunityPost;
          setPosts(prev => {
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [newPost, ...prev];
          });
        } catch (e) {
          console.error(e);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postSubscription);
    };
  }, [fetchPosts, fetchRooms]);

  const createPost = async (content: string, category: string, imageUrl?: string) => {
    const localPostsKey = 'agrolink_community_posts';
    
    // Prepare mock/local profile
    const fakePostId = `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newLocalPost: CommunityPost = {
      id: fakePostId,
      authorId: userId || 'anonymous',
      content,
      category,
      imageUrl,
      likesCount: 0,
      commentsCount: 0,
      isTrending: false,
      createdAt: new Date().toISOString(),
      isLiked: false,
      author: {
        id: userId || 'anonymous',
        displayName: 'You (Farmer)',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'anonymous'}`,
        location: 'Kakamega',
        farmingInterests: [],
        cropsGrown: [],
        reputationScore: 100,
        contributionsCount: 1,
        bio: ''
      }
    };

    // Save locally
    try {
      const existing = JSON.parse(localStorage.getItem(localPostsKey) || '[]');
      localStorage.setItem(localPostsKey, JSON.stringify([newLocalPost, ...existing]));
    } catch (e) {
      console.error(e);
    }

    // Instantly enrich UX
    setPosts(prev => [newLocalPost, ...prev]);

    if (!isSupabaseConfigured || !userId) {
      return { data: newLocalPost, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          authorId: userId,
          content,
          category,
          imageUrl,
        })
        .select()
        .single();
      
      return { data: data || newLocalPost, error };
    } catch (err) {
      console.error('Error inserting post to database:', err);
      return { data: newLocalPost, error: null };
    }
  };

  const likePost = async (postId: string) => {
    if (!userId) return;

    // Toggle optimistic state
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const wasLiked = p.isLiked;
        return {
          ...p,
          likesCount: wasLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
          isLiked: !wasLiked
        };
      }
      return p;
    }));

    if (!isSupabaseConfigured) {
      return;
    }

    try {
      await supabase.rpc('toggle_post_like', {
        target_post_id: postId,
        user_id: userId
      });
    } catch (err) {
      console.error('RPC toggle like failed:', err);
    }
  };

  const deletePost = async (postId: string) => {
    // 1. Optimistic Update
    setPosts(prev => prev.filter(p => p.id !== postId));

    // Delete from Local Storage and track as deleted
    try {
      const existing: CommunityPost[] = JSON.parse(localStorage.getItem('agrolink_community_posts') || '[]');
      const filtered = existing.filter(p => p.id !== postId);
      localStorage.setItem('agrolink_community_posts', JSON.stringify(filtered));

      const deletedIds: string[] = JSON.parse(localStorage.getItem('agrolink_deleted_post_ids') || '[]');
      if (!deletedIds.includes(postId)) {
        deletedIds.push(postId);
        localStorage.setItem('agrolink_deleted_post_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error(e);
    }

    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);
      return { success: !error, error };
    } catch (err) {
      console.error('Error deleting post:', err);
      return { success: false, error: err };
    }
  };

  return { posts, rooms, loading, fetchPosts, fetchRooms, createPost, likePost, deletePost };
}

export function useComments(postId: string, userId: string | undefined) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);

    const localCommentsKey = `agrolink_comments_${postId}`;
    let localComments: CommunityComment[] = [];
    try {
      localComments = JSON.parse(localStorage.getItem(localCommentsKey) || '[]');
    } catch (e) {
      console.error(e);
    }

    if (!isSupabaseConfigured) {
      const defaults = DEFAULT_COMMENTS[postId] || [];
      setComments([...defaults, ...localComments]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*, author:farmer_profiles(*)')
        .eq('postId', postId)
        .order('createdAt', { ascending: true });
      
      if (!error && data) {
        setComments([...data, ...localComments.filter(lc => !data.some(d => d.id === lc.id))]);
      } else {
        const defaults = DEFAULT_COMMENTS[postId] || [];
        setComments([...defaults, ...localComments]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      const defaults = DEFAULT_COMMENTS[postId] || [];
      setComments([...defaults, ...localComments]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = async (content: string) => {
    const fakeCommentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newComment: CommunityComment = {
      id: fakeCommentId,
      postId,
      authorId: userId || 'anonymous',
      content,
      createdAt: new Date().toISOString(),
      author: {
        id: userId || 'anonymous',
        displayName: 'You (Farmer)',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'anonymous'}`,
        location: 'Kakamega',
        farmingInterests: [],
        cropsGrown: [],
        reputationScore: 100,
        contributionsCount: 1,
        bio: ''
      }
    };

    // Save to localStorage
    const localCommentsKey = `agrolink_comments_${postId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(localCommentsKey) || '[]');
      localStorage.setItem(localCommentsKey, JSON.stringify([...existing, newComment]));
    } catch (e) {
      console.error(e);
    }

    // Update state instantly
    setComments(prev => [...prev, newComment]);

    if (!isSupabaseConfigured || !userId) {
      return { data: newComment, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          postId,
          authorId: userId,
          content
        })
        .select('*, author:farmer_profiles(*)')
        .single();

      if (!error && data) {
        // Replace mock with database version
        setComments(prev => prev.map(c => c.id === fakeCommentId ? data : c));
        await supabase.rpc('increment_comment_count', { post_id: postId });
      }
      return { data: data || newComment, error };
    } catch (err) {
      console.error('Error adding comment to database:', err);
      return { data: newComment, error: null };
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, addComment, refreshComments: fetchComments };
}

export const parseMessage = (msg: ChatMessage): ChatMessage => {
  if (msg.replyTo) return msg; // Already has replyTo field set
  if (msg.content && msg.content.startsWith('_REPLY_TO_:')) {
    const divider = msg.content.indexOf('_CONTENT_:');
    if (divider !== -1) {
      try {
        const replyJson = msg.content.substring(11, divider);
        const replyTo = JSON.parse(replyJson);
        const content = msg.content.substring(divider + 10);
        return {
          ...msg,
          content,
          replyTo
        };
      } catch (e) {
        console.error('Error parsing reply content: ', e);
      }
    }
  }
  return msg;
};

export function useChat(roomId: string, userOrUserId: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Safely support being called with either userId or user object
  const user = typeof userOrUserId === 'object' ? userOrUserId : null;
  const userId = typeof userOrUserId === 'object' ? userOrUserId?.id : userOrUserId;

  const storageKey = `agrolink_chat_messages_${roomId}`;

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);

      // Fetch from local storage fallback
      let localMessages: ChatMessage[] = [];
      try {
        localMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch (e) {
        console.error(e);
      }

      let deletedMsgIds: string[] = [];
      try {
        deletedMsgIds = JSON.parse(localStorage.getItem('agrolink_deleted_message_ids') || '[]');
      } catch (e) {}

      const defaultMsgsForRoom = DEFAULT_MESSAGES[roomId] || [];

      if (!isSupabaseConfigured) {
        const unfiltered = [...defaultMsgsForRoom, ...localMessages].map(parseMessage);
        setMessages(unfiltered.filter(m => !deletedMsgIds.includes(m.id)));
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*, author:farmer_profiles(*)')
          .eq('roomId', roomId)
          .order('createdAt', { ascending: true })
          .limit(100);
        
        if (!error && data) {
          // Merge db and local unsynced chats
          const merged = [...data, ...localMessages.filter(lm => !data.some(d => d.id === lm.id))];
          setMessages(merged.map(parseMessage).filter(m => !deletedMsgIds.includes(m.id)));
        } else {
          const unfiltered = [...defaultMsgsForRoom, ...localMessages].map(parseMessage);
          setMessages(unfiltered.filter(m => !deletedMsgIds.includes(m.id)));
        }
      } catch (err) {
        console.error('Error fetching chat messages', err);
        const unfiltered = [...defaultMsgsForRoom, ...localMessages].map(parseMessage);
        setMessages(unfiltered.filter(m => !deletedMsgIds.includes(m.id)));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (!isSupabaseConfigured) return;

    // Realtime subscription (INSERT and DELETE)
    const channelName = `room-${roomId}-${Math.random().toString(36).substring(7)}`;
    const messageSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', { 
         event: '*', 
         schema: 'public', 
         table: 'chat_messages'
      }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          return;
        }
        if (payload.eventType !== 'INSERT') return;
        // filter on payload roomId manually or via custom check to avoid case-sensitivity bugs on roomId column filter
        if (payload.new.roomId !== roomId) return;

        try {
          const { data: authorData } = await supabase
            .from('farmer_profiles')
            .select('*')
            .eq('id', payload.new.authorId)
            .single();
          
          const rawMessage = { ...payload.new, author: authorData } as ChatMessage;
          const newMessage = parseMessage(rawMessage);
          setMessages(prev => {
            // Prevent duplicate insertion
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        } catch (e) {
          console.error(e);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [roomId, storageKey]);

  const sendMessage = async (
    content: string, 
    imageUrl?: string, 
    replyTo?: { id: string; authorName: string; content: string }
  ) => {
    const fakeMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const dbContent = replyTo 
      ? `_REPLY_TO_:${JSON.stringify(replyTo)}_CONTENT_:${content}` 
      : content;

    const newMessage: ChatMessage = {
      id: fakeMessageId,
      roomId,
      authorId: userId || 'anonymous',
      content: dbContent,
      imageUrl,
      createdAt: new Date().toISOString(),
      author: {
        id: userId || 'anonymous',
        displayName: user?.name || 'You (Farmer)',
        avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'anonymous'}`,
        location: user?.region || 'Kakamega',
        farmingInterests: [],
        cropsGrown: [],
        reputationScore: 120,
        contributionsCount: 1,
        bio: ''
      },
      replyTo // UI local display version
    };

    // 1. Optimistic Update: instantly append to ui as parsed
    const uiMessage = parseMessage(newMessage);
    setMessages(prev => [...prev, uiMessage]);

    // Add search room id to joined list to auto-upgrade members size
    try {
      const joined: string[] = JSON.parse(localStorage.getItem('agrolink_joined_rooms') || '[]');
      if (!joined.includes(roomId)) {
        joined.push(roomId);
        localStorage.setItem('agrolink_joined_rooms', JSON.stringify(joined));
      }
    } catch (e) {}

    // 2. Save to Local Storage fallback with the database/encoded format
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...existing, newMessage]));
    } catch (e) {
      console.error(e);
    }

    if (!isSupabaseConfigured || !userId) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          roomId,
          authorId: userId,
          content: dbContent,
          imageUrl,
        });

      return { error };
    } catch (err) {
      console.error('Error sending message:', err);
      return { error: null };
    }
  };

  const deleteMessage = async (messageId: string) => {
    // 1. Optimistic UI Update
    setMessages(prev => prev.filter(m => m.id !== messageId));

    // Delete from Local Storage and track as deleted
    try {
      const existing: ChatMessage[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filtered = existing.filter(m => m.id !== messageId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));

      const deletedIds: string[] = JSON.parse(localStorage.getItem('agrolink_deleted_message_ids') || '[]');
      if (!deletedIds.includes(messageId)) {
        deletedIds.push(messageId);
        localStorage.setItem('agrolink_deleted_message_ids', JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error(e);
    }

    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);
      return { success: !error, error };
    } catch (err) {
      console.error('Error deleting message:', err);
      return { success: false, error: err };
    }
  };

  return { messages, loading, sendMessage, deleteMessage };
}
