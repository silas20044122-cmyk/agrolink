import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Notification } from '../types';
import { generateMarketInsight } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  refreshMarketInsight: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    // Real-time subscription
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
  [notifications]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    if (!userId) {
      // Fallback for non-logged in state (AI insights etc)
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        userId
      })
      .select()
      .single();

    if (!error && data) {
      // Subscription will catch it or we update manually
      setNotifications(prev => [data, ...prev]);
    }
  }, [userId]);

  const refreshMarketInsight = useCallback(async () => {
    try {
      const insight = await generateMarketInsight();
      await addNotification({
        title: insight.title,
        message: insight.insight,
        type: insight.type as any,
      });
      localStorage.setItem('agrolink_last_insight', Date.now().toString());
    } catch (error) {
      console.error('Failed to generate market insight:', error);
    }
  }, [addNotification]);

  // Hourly background check for insights
  useEffect(() => {
    if (!userId) return;
    
    const ONE_HOUR = 3600000;
    const checkAndGenerate = async () => {
      const lastInsight = localStorage.getItem('agrolink_last_insight');
      const now = Date.now();
      
      if (!lastInsight || (now - parseInt(lastInsight)) >= ONE_HOUR) {
        await refreshMarketInsight();
      }
    };

    checkAndGenerate();
    const interval = setInterval(checkAndGenerate, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [refreshMarketInsight, userId]);

  const markAsRead = useCallback(async (id: string) => {
    // If it's a UUID, update in DB, else local
    if (id.length > 20) { 
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    }
    
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (userId) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', userId);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [userId]);

  const deleteNotification = useCallback(async (id: string) => {
    if (id.length > 20) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
      refreshMarketInsight
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
