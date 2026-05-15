import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Notification } from '../types';
import { generateMarketInsight } from '../services/geminiService';

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

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Pest Alert',
    message: 'Increased Fall Armyworm activity detected in Uasin Gishu region.',
    type: 'warning',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: '2',
    title: 'Market Update',
    message: 'Maize prices in Eldoret have increased by 5% today.',
    type: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: false,
  },
  {
    id: '3',
    title: 'Weather Warning',
    message: 'Heavy rainfall expected in your area starting tomorrow. Ensure proper drainage.',
    type: 'error',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: '4',
    title: 'Harvest Ready',
    message: 'Your Tomato crop in "North Field" is estimated to be ready for harvest in 3 days.',
    type: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('agrolink_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('agrolink_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
  [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const refreshMarketInsight = useCallback(async () => {
    try {
      const insight = await generateMarketInsight();
      addNotification({
        title: insight.title,
        message: insight.insight,
        type: insight.type as any,
      });
      localStorage.setItem('agrolink_last_insight', Date.now().toString());
    } catch (error) {
      console.error('Failed to generate market insight:', error);
    }
  }, [addNotification]);

  // Hourly background check
  useEffect(() => {
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
  }, [refreshMarketInsight]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
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
