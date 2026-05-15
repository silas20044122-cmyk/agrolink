import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

export function useCommunity(userId: string | undefined) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (category?: string) => {
    setLoading(true);
    let query = supabase
      .from('community_posts')
      .select('*, author:farmer_profiles(*)')
      .order('createdAt', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data: postsData, error: postsError } = await query;
    if (!postsError && postsData) {
      if (userId) {
        // Fetch likes for these posts by current user
        const postIds = postsData.map(p => p.id);
        const { data: likesData } = await supabase
          .from('community_post_likes')
          .select('postId')
          .eq('authorId', userId)
          .in('postId', postIds);
        
        const likedPostIds = new Set(likesData?.map(l => l.postId) || []);
        const postsWithLikes = postsData.map(p => ({
          ...p,
          isLiked: likedPostIds.has(p.id)
        }));
        setPosts(postsWithLikes);
      } else {
        setPosts(postsData);
      }
    } else if (postsError) {
      console.error('Error fetching community posts:', postsError);
    }
    setLoading(false);
  }, [userId]);

  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('category', { ascending: true });
    
    if (!error && data) {
       setRooms(data);
    } else if (error) {
       console.error('Error fetching chat rooms:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchRooms();

    // Subscribe to new posts
    const channelName = `community-posts-${Math.random().toString(36).substring(7)}`;
    const postSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, async (payload) => {
        const { data: authorData } = await supabase
          .from('farmer_profiles')
          .select('*')
          .eq('id', payload.new.authorId)
          .single();
        
        const newPost = { ...payload.new, author: authorData } as CommunityPost;
        setPosts(prev => [newPost, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postSubscription);
    };
  }, [fetchPosts, fetchRooms]);

  const createPost = async (content: string, category: string, imageUrl?: string) => {
    if (!userId) return;
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
    
    return { data, error };
  };

  const likePost = async (postId: string) => {
    if (!userId) return;

    const { data: isLiked, error } = await supabase.rpc('toggle_post_like', {
      target_post_id: postId,
      user_id: userId
    });
    
    if (!error) {
       setPosts(prev => prev.map(p => {
         if (p.id === postId) {
           return { 
             ...p, 
             likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
             isLiked: isLiked
           };
         }
         return p;
       }));
    }
  };

  return { posts, rooms, loading, fetchPosts, createPost, likePost };
}

export function useComments(postId: string, userId: string | undefined) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_comments')
      .select('*, author:farmer_profiles(*)')
      .eq('postId', postId)
      .order('createdAt', { ascending: true });
    
    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  }, [postId]);

  const addComment = async (content: string) => {
    if (!userId) return { error: new Error('User not authenticated') };
    
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
      setComments(prev => [...prev, data]);
      // Also update the comment count on the post
      await supabase.rpc('increment_comment_count', { post_id: postId });
    }

    return { data, error };
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, addComment, refreshComments: fetchComments };
}

export function useChat(roomId: string, userId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, author:farmer_profiles(*)')
        .eq('roomId', roomId)
        .order('createdAt', { ascending: true })
        .limit(50);
      
      if (!error && data) setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    // Realtime subscription
    const channelName = `room-${roomId}-${Math.random().toString(36).substring(7)}`;
    const messageSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `roomId=eq.${roomId}` }, async (payload) => {
        const { data: authorData } = await supabase
          .from('farmer_profiles')
          .select('*')
          .eq('id', payload.new.authorId)
          .single();
        
        const newMessage = { ...payload.new, author: authorData } as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [roomId]);

  const sendMessage = async (content: string, imageUrl?: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        roomId,
        authorId: userId,
        content,
        imageUrl,
      });
    return { error };
  };

  return { messages, loading, sendMessage };
}
