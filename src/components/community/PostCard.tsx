import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Clock, MapPin, Award, Send, Trash2 } from 'lucide-react';
import { CommunityPost, useComments } from '@/src/hooks/useCommunity';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';
import { isSupabaseConfigured } from '@/src/lib/supabase';

interface PostCardProps {
  post: CommunityPost;
  onLike: () => void;
  userId?: string;
  onDelete?: () => void;
}

export default function PostCard({ post, onLike, userId, onDelete }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { comments, addComment, loading: commentsLoading } = useComments(post.id, userId);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting || !userId) return;

    setSubmitting(true);
    const { error } = await addComment(commentText);
    if (!error) {
      setCommentText('');
    }
    setSubmitting(false);
  };

  return (
    <motion.div 
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group relative"
    >
      {/* Dynamic Copy Toast Accent */}
      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-primary-dark text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl whitespace-nowrap"
          >
            <Share2 size={12} className="text-primary-fresh animate-pulse" />
            <span>Link Copied to Clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Post Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden">
               {post.author?.avatarUrl && (post.author.avatarUrl.startsWith('http') || post.author.avatarUrl.includes('/')) ? (
                 <img src={post.author.avatarUrl} alt={post.author.displayName} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-2xl">{post.author?.avatarUrl || '👨‍🌾'}</span>
               )}
            </div>
             {post.author?.reputationScore && post.author.reputationScore > 1000 && (
               <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">
                  <Award size={10} />
               </div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-primary-dark">{post.author?.displayName || 'Unknown Farmer'}</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-fresh/10 text-primary-fresh rounded-full uppercase tracking-widest">{post.category}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               <span className="flex items-center gap-1"><Clock size={10} /> {formatDistanceToNow(new Date(post.createdAt))} ago</span>
               {post.author?.location && (
                 <span className="flex items-center gap-1"><MapPin size={10} /> {post.author.location}</span>
               )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-300 hover:text-gray-650 hover:bg-gray-50 rounded-full transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20 overflow-hidden"
                >
                  <button
                    onClick={handleShare}
                    disabled={copied}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <Share2 size={14} className={cn("text-gray-400", copied && "text-primary-fresh")} />
                    {copied ? 'Link Copied!' : 'Share Link'}
                  </button>
                  {onDelete && (!isSupabaseConfigured || (userId && (post.authorId === userId || post.author?.id === userId))) && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this discussion post?')) {
                          onDelete();
                        }
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50"
                    >
                      <Trash2 size={14} className="text-red-400" />
                      Delete Post
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-8 pb-6 space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed font-medium">
          {post.content}
        </p>
        
        {post.imageUrl && (
          <div className="rounded-[2rem] overflow-hidden border border-gray-100">
             <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-96" />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onLike}
            className="flex items-center gap-2 group/btn"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 group-hover/btn:text-red-500 group-hover/btn:border-red-100 group-hover/btn:bg-red-50 transition-all",
              post.isLiked && "text-red-500 border-red-100 bg-red-50"
            )}>
               <Heart size={18} className={cn(post.isLiked && "fill-red-500 text-red-500")} />
            </div>
            <span className="text-xs font-black text-gray-400 group-hover/btn:text-red-500">{post.likesCount}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 group/btn text-left"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 group-hover/btn:text-primary-fresh group-hover/btn:border-primary-fresh/20 group-hover/btn:bg-primary-fresh/5 transition-all",
              showComments && "text-primary-fresh border-primary-fresh/20 bg-primary-fresh/5"
            )}>
               <MessageSquare size={18} />
            </div>
            <span className="text-xs font-black text-gray-400 group-hover/btn:text-primary-dark">
              {comments.length || post.commentsCount}
            </span>
          </button>
        </div>

        <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-primary-dark hover:border-gray-200 transition-all">
          <Share2 size={18} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6 bg-white space-y-6">
              {/* Comment Form */}
              {userId ? (
                <form onSubmit={handleAddComment} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 uppercase font-bold text-xs text-gray-400">
                    You
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Share your thoughts..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary-fresh/20 outline-none transition-all pr-12"
                    />
                    <button 
                      type="submit"
                      disabled={!commentText.trim() || submitting}
                      className="absolute right-2 top-1.5 p-1.5 bg-primary-fresh text-primary-dark rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sign in to join the conversation</p>
                </div>
              )}

              {/* Comment List */}
              <div className="space-y-4">
                {commentsLoading && comments.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-fresh border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group/comment">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                        {comment.author?.avatarUrl && (comment.author.avatarUrl.startsWith('http') || comment.author.avatarUrl.includes('/')) ? (
                          <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{comment.author?.avatarUrl || '👨‍🌾'}</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary-dark">{comment.author?.displayName || 'Farmer'}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-2xl rounded-tl-none border border-gray-100/50">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-300">
                      <MessageSquare size={20} />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
