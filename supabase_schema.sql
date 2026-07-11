-- RESET SCHEMA: Drop all existing tables
DROP TABLE IF EXISTS shared_delivery_group_members CASCADE;
DROP TABLE IF EXISTS shared_delivery_groups CASCADE;
DROP TABLE IF EXISTS transport_requests CASCADE;
DROP TABLE IF EXISTS transporters CASCADE;
DROP TABLE IF EXISTS community_comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS farmer_profiles CASCADE;

-- 1. Farmer Profiles (Extends Auth)
CREATE TABLE farmer_profiles (
    id UUID PRIMARY KEY, -- Same as auth.uid()
    email TEXT UNIQUE,
    full_name TEXT,
    username TEXT,
    phone TEXT,
    county TEXT,
    sub_county TEXT,
    ward TEXT,
    bio TEXT,
    avatar_path TEXT,
    avatar_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Legacy & backward-compatibility fields
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "location" TEXT,
    "farmingInterests" TEXT[] DEFAULT '{}',
    "cropsGrown" TEXT[] DEFAULT '{}',
    "reputationScore" INTEGER DEFAULT 0,
    "contributionsCount" INTEGER DEFAULT 0,
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON farmer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON farmer_profiles FOR ALL USING (auth.uid() = id);

-- 2. Farms
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "farmerId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "totalArea" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "subCounty" TEXT,
    "registrationDate" DATE DEFAULT CURRENT_DATE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own farms" ON farms FOR ALL USING (auth.uid() = "farmerId");

-- 3. Crops
CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "farmId" UUID REFERENCES farms(id) ON DELETE CASCADE,
    "farmerId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "plantingDate" DATE,
    "expectedHarvest" DATE,
    "status" TEXT DEFAULT 'planted',
    "healthScore" NUMERIC DEFAULT 100,
    "location" TEXT,
    "area" TEXT,
    "typeId" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own crops" ON crops FOR ALL USING (auth.uid() = "farmerId");

-- 4. Transport System
CREATE TABLE transport_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "farmerId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "produceType" TEXT NOT NULL,
    "quantity" NUMERIC NOT NULL,
    "unit" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "preferredDate" DATE NOT NULL,
    "urgency" TEXT DEFAULT 'medium',
    "status" TEXT DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transport requests" ON transport_requests FOR ALL USING (auth.uid() = "farmerId");

CREATE TABLE transporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "maxCapacity" TEXT NOT NULL,
    "currentLocation" TEXT NOT NULL,
    "available" BOOLEAN DEFAULT true,
    "rating" NUMERIC(3,2) DEFAULT 5.0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view for transporters" ON transporters FOR SELECT USING (true);

CREATE TABLE shared_delivery_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "destination" TEXT NOT NULL,
    "transportDate" DATE NOT NULL,
    "estimatedSavings" NUMERIC DEFAULT 0,
    "status" TEXT DEFAULT 'planning',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared_delivery_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view for shared groups" ON shared_delivery_groups FOR SELECT USING (true);

CREATE TABLE shared_delivery_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "groupId" UUID REFERENCES shared_delivery_groups(id) ON DELETE CASCADE,
    "requestId" UUID REFERENCES transport_requests(id) ON DELETE CASCADE,
    "farmerId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared_delivery_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view for group members" ON shared_delivery_group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON shared_delivery_group_members FOR INSERT WITH CHECK (auth.uid() = "farmerId");

-- 5. Community & Chat
CREATE TABLE chat_rooms (
    id TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT,
    "activeUsers" INTEGER DEFAULT 0
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms viewable by all" ON chat_rooms FOR SELECT USING (true);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "roomId" TEXT REFERENCES chat_rooms(id) ON DELETE CASCADE,
    "authorId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages viewable by all" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = "authorId");

CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "authorId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT DEFAULT 'General',
    "likesCount" INTEGER DEFAULT 0,
    "commentsCount" INTEGER DEFAULT 0,
    "isTrending" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts viewable by all" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can manage own posts" ON community_posts FOR ALL USING (auth.uid() = "authorId");

CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "postId" UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    "authorId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by all" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON community_comments FOR INSERT WITH CHECK (auth.uid() = "authorId");

-- 6. Likes
CREATE TABLE community_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "postId" UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    "authorId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("postId", "authorId")
);

ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes viewable by all" ON community_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON community_post_likes FOR ALL USING (auth.uid() = "authorId");

-- 7. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- RPC Functions
CREATE OR REPLACE FUNCTION increment_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET "commentsCount" = "commentsCount" + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Functions for Notifications
CREATE OR REPLACE FUNCTION handle_new_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  comment_author_name TEXT;
BEGIN
  -- Get post author
  SELECT "authorId" INTO post_author_id FROM community_posts WHERE id = NEW."postId";
  
  -- Get commenter name
  SELECT "displayName" INTO comment_author_name FROM farmer_profiles WHERE id = NEW."authorId";
  
  -- Don't notify if commenting on own post
  IF post_author_id != NEW."authorId" THEN
    INSERT INTO notifications ("userId", title, message, type)
    VALUES (
      post_author_id,
      'New Comment',
      comment_author_name || ' commented on your post: "' || LEFT(NEW.content, 50) || '..."',
      'info'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_new_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  liker_name TEXT;
BEGIN
  -- Get post author
  SELECT "authorId" INTO post_author_id FROM community_posts WHERE id = NEW."postId";
  
  -- Get liker name
  SELECT "displayName" INTO liker_name FROM farmer_profiles WHERE id = NEW."authorId";
  
  -- Don't notify if liking own post
  IF post_author_id != NEW."authorId" THEN
    INSERT INTO notifications ("userId", title, message, type)
    VALUES (
      post_author_id,
      'New Like',
      liker_name || ' liked your post.',
      'success'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
CREATE TRIGGER on_community_comment_added
  AFTER INSERT ON community_comments
  FOR EACH ROW EXECUTE FUNCTION handle_new_comment_notification();

CREATE TRIGGER on_community_like_added
  AFTER INSERT ON community_post_likes
  FOR EACH ROW EXECUTE FUNCTION handle_new_like_notification();

CREATE OR REPLACE FUNCTION toggle_post_like(target_post_id UUID, user_id UUID)
RETURNS boolean AS $$
DECLARE
  is_liked boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM community_post_likes WHERE "postId" = target_post_id AND "authorId" = user_id) INTO is_liked;
  
  IF is_liked THEN
    DELETE FROM community_post_likes WHERE "postId" = target_post_id AND "authorId" = user_id;
    UPDATE community_posts SET "likesCount" = GREATEST(0, "likesCount" - 1) WHERE id = target_post_id;
    RETURN false;
  ELSE
    INSERT INTO community_post_likes ("postId", "authorId") VALUES (target_post_id, user_id);
    UPDATE community_posts SET "likesCount" = "likesCount" + 1 WHERE id = target_post_id;
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEED DATA (System Data only)
INSERT INTO chat_rooms (id, name, description, icon, category, "activeUsers")
VALUES 
('general', 'General Farming', 'Discuss anything related to farming', '🌾', 'General', 12),
('maize', 'Maize Growers', 'Maize-specific challenges', '🌽', 'Crops', 8),
('livestock', 'Livestock & Poultry', 'Animal health and dairy', '🐄', 'Livestock', 5),
('market', 'Market Hub', 'Real-time price updates', '📈', 'Market', 15),
('pests', 'Pest & Disease Support', 'AI-assisted diagnosis and peer help', '🔍', 'Support', 24)
ON CONFLICT (id) DO NOTHING;

INSERT INTO transporters (name, phone, "vehicleType", "maxCapacity", "currentLocation", available, rating)
VALUES 
('Otieno Logistics', '+254711223344', 'Truck', '5 Tons', 'Kakamega', true, 4.8),
('Mumias Express', '+254722334455', 'Pickup', '1 Ton', 'Mumias', true, 4.5),
('Western Hauliers', '+254733445566', 'Lorry', '10 Tons', 'Eldoret', true, 4.9)
ON CONFLICT DO NOTHING;

-- SEED COMMUNITY DATA
-- Create persistent system/demo profiles
INSERT INTO farmer_profiles (id, "displayName", "avatarUrl", "location", "reputationScore")
VALUES 
('00000000-0000-0000-0000-000000000001', 'David K.', '👨‍🌾', 'Eldoret', 2500),
('00000000-0000-0000-0000-000000000002', 'Sarah M.', '👩‍🌾', 'Nairobi', 1800),
('00000000-0000-0000-0000-000000000003', 'Peter O.', '🚜', 'Kakamega', 1200)
ON CONFLICT (id) DO NOTHING;

-- Seed some community posts
INSERT INTO community_posts ("authorId", content, category, "likesCount", "commentsCount", "isTrending")
VALUES 
('00000000-0000-0000-0000-000000000001', 'Has anyone seen Fall Armyworm in Eldoret this week? Seeing some suspicious holes in my maize leaves.', 'Crop Diseases', 12, 3, true),
('00000000-0000-0000-0000-000000000002', 'Tomato prices are peaking at Nairobi Market (Wakulima). KES 4500 per crate today!', 'Market Trends', 45, 8, true),
('00000000-0000-0000-0000-000000000003', 'Best fertilizer for late-stage maize in Kakamega? Thinking of using CAN but open to suggestions.', 'Fertilizers', 24, 12, false)
ON CONFLICT DO NOTHING;

-- ====================================================
-- SUPABASE STORAGE & ROW-LEVEL SECURITY POLICIES
-- ====================================================

-- Ensure the storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any to prevent conflicts
DROP POLICY IF EXISTS "Profile images are public viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

-- Create Storage Policies for profile-images
CREATE POLICY "Profile images are public viewable" ON storage.objects 
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own profile image" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own profile image" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Drop existing table policies to ensure correctness
DROP POLICY IF EXISTS "Profiles viewable by all" ON farmer_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON farmer_profiles;

-- Create Row Level Security policies for farmer_profiles
CREATE POLICY "Profiles viewable by all" ON farmer_profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can manage own profile" ON farmer_profiles 
FOR ALL USING (auth.uid() = id);

-- Schema Migration Helper (for live environments where tables already exist)
DO $$
BEGIN
    -- Ensure farmer_profiles has all necessary new columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'email') THEN
        ALTER TABLE farmer_profiles ADD COLUMN email TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'full_name') THEN
        ALTER TABLE farmer_profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'username') THEN
        ALTER TABLE farmer_profiles ADD COLUMN username TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'phone') THEN
        ALTER TABLE farmer_profiles ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'county') THEN
        ALTER TABLE farmer_profiles ADD COLUMN county TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'sub_county') THEN
        ALTER TABLE farmer_profiles ADD COLUMN sub_county TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'ward') THEN
        ALTER TABLE farmer_profiles ADD COLUMN ward TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'avatar_path') THEN
        ALTER TABLE farmer_profiles ADD COLUMN avatar_path TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'avatar_updated_at') THEN
        ALTER TABLE farmer_profiles ADD COLUMN avatar_updated_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE farmer_profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farmer_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE farmer_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;
