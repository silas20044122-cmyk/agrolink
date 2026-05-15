import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';
import { Button } from './ui/Base';
import { cn } from '../lib/utils';

interface NotificationPopoverProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NotificationPopover({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose
}: NotificationPopoverProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="text-blue-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'error': return <AlertCircle className="text-red-500" size={18} />;
      case 'success': return <CheckCircle2 className="text-green-500" size={18} />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-14 right-0 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden flex flex-col max-h-[80vh]"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">Notifications</h3>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="bg-primary-fresh/10 text-primary-fresh text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {notifications.filter(n => !n.read).length} New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onMarkAllAsRead}
            className="p-2 text-gray-400 hover:text-primary-fresh hover:bg-primary-fresh/10 rounded-lg transition-all text-xs font-bold"
            title="Mark all as read"
          >
            <Check size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="text-gray-300" size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">All caught up!</p>
            <p className="text-xs text-gray-300">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence initial={false}>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "p-4 flex gap-3 transition-colors hover:bg-gray-50 group relative",
                    !notification.read && "bg-primary-fresh/5"
                  )}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={cn(
                        "text-sm font-bold truncate",
                        notification.read ? "text-gray-700" : "text-gray-900"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed break-words">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-fresh rounded-r-full" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
            <button className="text-xs font-bold text-gray-400 hover:text-primary-fresh transition-colors">
                View notification history
            </button>
        </div>
      )}
    </motion.div>
  );
}
