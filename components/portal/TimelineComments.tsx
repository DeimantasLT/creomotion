'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageSquare, Send, Check, CheckCheck, MoreVertical, X, CornerDownRight } from 'lucide-react';

interface TimelineComment {
  id: string;
  content: string;
  timestamp: number;
  authorId: string;
  authorType: 'CLIENT' | 'USER';
  resolved: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: TimelineComment[];
  authorName?: string;
}

interface TimelineCommentsProps {
  comments: TimelineComment[];
  currentTime: number;
  duration: number;
  onAddComment: (content: string, timestamp: number, parentId?: string) => Promise<void>;
  onResolveComment: (commentId: string, resolved: boolean) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onSeek: (timestamp: number) => void;
  currentUserId: string;
  className?: string;
}

// Format time as MM:SS
function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TimelineComments({
  comments,
  currentTime,
  duration,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  onSeek,
  currentUserId,
  className = ''
}: TimelineCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showResolved, setShowResolved] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Group comments by parent (threads)
  const rootComments = comments.filter(c => !c.parentId) || [];
  const commentMap = new Map(comments.map(c => [c.id, c]));

  // Filter comments
  const visibleComments = showResolved 
    ? rootComments 
    : rootComments.filter(c => !c.resolved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment, currentTime);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(replyContent, rootComments.find(c => c.id === parentId)?.timestamp || currentTime, parentId);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedComments = visibleComments.map(comment => ({
    ...comment,
    replies: comments.filter(c => c.parentId === comment.id)
  }));

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newComment]);

  useEffect(() => {
    if (replyTextareaRef.current) {
      replyTextareaRef.current.style.height = 'auto';
      replyTextareaRef.current.style.height = replyTextareaRef.current.scrollHeight + 'px';
    }
  }, [replyContent]);

  if (!comments) {
    return <div className="text-white/40 text-center py-8">Loading comments...</div>;
  }

  return (
    <div className={`flex flex-col h-full bg-[#141414] border-l border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Comments
            <span className="text-white/40 text-sm">({comments.filter(c => !c.parentId).length})</span>
          </h3>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showResolved 
                ? 'bg-[#3a86ff]/20 text-[#3a86ff]' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            {showResolved ? 'Hide resolved' : 'Show resolved'}
          </button>
        </div>

        {/* Timeline Preview */}
        <div className="relative h-8 bg-[#1a1a1a] rounded-lg overflow-hidden">
          <!-- Background bar -->
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/10 rounded-full" />
          
          <!-- Current Time Indicator -->
          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#ff006e]"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff006e] rounded-full" />
            </div>
          )}

          <!-- Comment Markers -->
          {visibleComments.map((comment) => (
            <button
              key={comment.id}
              onClick={() => onSeek(comment.timestamp)}
              className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-sm transition-all hover:scale-125 ${
                comment.resolved ? 'bg-[#3a86ff]/50' : 'bg-[#ff006e]'
              }`}
              style={{ left: `${duration > 0 ? (comment.timestamp / duration) * 100 : 0}%` }}
              title={`${formatTime(comment.timestamp)} - ${comment.content.substring(0, 50)}${
                comment.content.length > 50 ? '...' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedComments.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No comments yet</p>
            <p className="text-sm mt-1">Be the first to leave feedback</p>
          </div>
        ) : (
          groupedComments.map((comment) => (
            <div
              key={comment.id}
              className={`group relative ${comment.resolved ? 'opacity-60' : ''}`}
            >
              {/* Comment Card */}
              <div className={`p-3 rounded-lg border transition-all ${
                comment.resolved 
                  ? 'bg-[#1a1a1a]/50 border-white/5' 
                  : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSeek(comment.timestamp)}
                      className="px-2 py-0.5 bg-[#ff006e]/20 text-[#ff006e] text-xs font-mono 
                        rounded hover:bg-[#ff006e]/30 transition-colors"
                    >
                      {formatTime(comment.timestamp)}
                    </button>
                    <span className="text-xs text-white/60">
                      {comment.authorName || (comment.authorType === 'CLIENT' ? 'Client' : 'Team')}
                    </span>
                    {comment.resolved && (
                      <span className="flex items-center gap-1 text-xs text-[#3a86ff]">
                        <CheckCheck className="w-3 h-3" />
                        Resolved
                      </span>
                    )}
                  </div>

                  <!-- Actions Menu -->
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === comment.id ? null : comment.id);
                      }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-white/60" />
                    </button>

                    {openMenu === comment.id && (
                      <div className="absolute right-0 top-8 z-20 w-40 bg-[#1a1a1a] border border-white/10 
                        rounded-lg shadow-xl py-1">
                        {comment.authorId !== currentUserId && (
                          <button
                            onClick={() => {
                              onResolveComment(comment.id, !comment.resolved);
                              setOpenMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 
                              flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            {comment.resolved ? 'Unresolve' : 'Resolve'}
                          </button>
                        )}
                        {(comment.authorId === currentUserId || comment.authorType !== 'CLIENT') && (
                          <button
                            onClick={() => {
                              onDeleteComment(comment.id);
                              setOpenMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 
                              flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <!-- Content -->
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>

                <!-- Timestamp and Reply -->
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-white/40">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-[#3a86ff] hover:text-[#3a86ff]/80 
                      transition-colors flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    Reply
                  </button>
                </div>
              </div>

              <!-- Replies -->
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-white/10 space-y-2"
                >
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-3 bg-[#1a1a1a]/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60">
                          {reply.authorName || (reply.authorType === 'CLIENT' ? 'Client' : 'Team')}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <!-- Reply Input -->
              {replyingTo === comment.id && (
                <div className="mt-2 ml-4">
                  <div className="flex gap-2">
                    <textarea
                      ref={replyTextareaRef}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2
                        text-sm text-white placeholder:text-white/30 resize-none min-h-[40px] 
                        focus:outline-none focus:border-[#3a86ff]/50"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(comment.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyContent.trim() || isSubmitting}
                      className="px-3 py-2 bg-[#3a86ff] text-white rounded-lg 
                        hover:bg-[#3a86ff]/80 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <!-- New Comment Input -->
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/40">Add comment at</span>
          <span className="px-2 py-0.5 bg-[#ff006e]/20 text-[#ff006e] text-xs font-mono rounded"
          >
            {formatTime(currentTime)}
          </span>
        </div>
        
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your feedback..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2
              text-sm text-white placeholder:text-white/30 resize-none min-h-[64px]
              focus:outline-none focus:border-[#ff006e]/50"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="self-end p-3 bg-gradient-to-r from-[#ff006e] to-[#8338ec] 
              text-white rounded-lg hover:opacity-90 disabled:opacity-50 
              disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
