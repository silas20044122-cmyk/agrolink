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

    if (!isSupabaseConfigured) {
      // Offline/Mock mode
      let filteredPosts = localPosts.length > 0 ? [...localPosts] : [...DEFAULT_POSTS];
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
        const merged = [...localPosts.filter(lp => !postsData.some(p => p.id === lp.id)), ...postsData];
        
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
        let filteredPosts = localPosts.length > 0 ? [...localPosts] : [...DEFAULT_POSTS];
        if (category && category !== 'All') {
          filteredPosts = filteredPosts.filter(p => p.category === category);
        }
        setPosts(filteredPosts);
      }
    } catch (err) {
      console.error('Error fetching community posts, falling back:', err);
      let filteredPosts = localPosts.length > 0 ? [...localPosts] : [...DEFAULT_POSTS];
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
      setRooms(DEFAULT_ROOMS);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('category', { ascending: true });
      
      if (!error && data && data.length > 0) {
         setRooms(data);
      } else {
         setRooms(DEFAULT_ROOMS);
      }
    } catch (err) {
      console.error('Error fetching chat rooms, falling back:', err);
      setRooms(DEFAULT_ROOMS);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchRooms();

    if (!isSupabaseConfigured) return;

    // Subscribe to new posts
    const channelName = `community-posts-${Math.random().toString(36).substring(7)}`;
    const postSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, async (payload) => {
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

  return { posts, rooms, loading, fetchPosts, createPost, likePost };
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

      const defaultMsgsForRoom = DEFAULT_MESSAGES[roomId] || [];

      if (!isSupabaseConfigured) {
        setMessages([...defaultMsgsForRoom, ...localMessages]);
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
          setMessages(merged);
        } else {
          setMessages([...defaultMsgsForRoom, ...localMessages]);
        }
      } catch (err) {
        console.error('Error fetching chat messages', err);
        setMessages([...defaultMsgsForRoom, ...localMessages]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (!isSupabaseConfigured) return;

    // Realtime subscription
    const channelName = `room-${roomId}-${Math.random().toString(36).substring(7)}`;
    const messageSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', { 
         event: 'INSERT', 
         schema: 'public', 
         table: 'chat_messages'
      }, async (payload) => {
        // filter on payload roomId manually or via custom check to avoid case-sensitivity bugs on roomId column filter
        if (payload.new.roomId !== roomId) return;

        try {
          const { data: authorData } = await supabase
            .from('farmer_profiles')
            .select('*')
            .eq('id', payload.new.authorId)
            .single();
          
          const newMessage = { ...payload.new, author: authorData } as ChatMessage;
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

  const sendMessage = async (content: string, imageUrl?: string) => {
    const fakeMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newMessage: ChatMessage = {
      id: fakeMessageId,
      roomId,
      authorId: userId || 'anonymous',
      content,
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
      }
    };

    // 1. Optimistic Update: instantly append to ui so it feels real-time of 0ms lag
    setMessages(prev => [...prev, newMessage]);

    // 2. Save to Local Storage fallback
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
          content,
          imageUrl,
        });

      return { error };
    } catch (err) {
      console.error('Error sending message:', err);
      return { error: null };
    }
  };

  return { messages, loading, sendMessage };
}
