'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown,
  Download,
  Maximize2,
  MessageSquare
} from 'lucide-react';
import VideoPlayer from '@/components/portal/VideoPlayer';
import TimelineComments from '@/components/portal/TimelineComments';
import { useAuth } from '@/hooks/useAuth';

interface TimelineComment {
  id: string;
  content: string;
  timestamp: number;
  authorId: string;
  authorType: 'CLIENT' | 'USER';
  resolved: boolean;
  parentId: string | null;
  createdAt: string;
  replies?: TimelineComment[];
  authorName?: string;
}

interface DeliverableVersion {
  id: string;
  versionNumber: number;
  fileUrl: string;
  thumbnailUrl?: string;
  notes?: string;
  createdAt: string;
}

interface Deliverable {
  id: string;
  name: string;
  description?: string;
  status: string;
  version: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  project?: {
    id: string;
    name: string;
    client?: { name: string };
  };
}

// Get status colors
const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-white/10', text: 'text-white', border: 'border-white/20' },
  IN_PROGRESS: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  IN_REVIEW: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  REVIEW: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  APPROVED: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

// Format time
function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const deliverableId = params.id as string;

  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [comments, setComments] = useState<TimelineComment[]>([]);
  const [versions, setVersions] = useState<DeliverableVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'comments' | 'versions'>('comments');

  // Fetch deliverable and related data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch deliverable
      const deliverableRes = await fetch(`/api/deliverables/${deliverableId}`);
      if (!deliverableRes.ok) throw new Error('Failed to fetch deliverable');
      const deliverableData = await deliverableRes.json();
      setDeliverable(deliverableData.deliverable);

      // Fetch comments
      const commentsRes = await fetch(`/api/deliverables/${deliverableId}/timeline-comments`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      }

      // Fetch versions
      const versionsRes = await fetch(`/api/deliverables/${deliverableId}/versions`);
      if (versionsRes.ok) {
        const versionsData = await versionsRes.json();
        setVersions(versionsData.versions || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliverable');
    } finally {
      setIsLoading(false);
    }
  }, [deliverableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle approve
  const handleApprove = async () => {
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Approved via portal' }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      await fetchData();
    } catch (err) {
      alert('Failed to approve deliverable');
    }
  };

  // Handle request changes
  const handleRequestChanges = async () => {
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Changes requested via portal' }),
      });
      if (!res.ok) throw new Error('Failed to request changes');
      await fetchData();
    } catch (err) {
      alert('Failed to request changes');
    }
  };

  // Handle add comment
  const handleAddComment = async (content: string, timestamp: number, parentId?: string) => {
    const res = await fetch(`/api/deliverables/${deliverableId}/timeline-comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, timestamp, parentId }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    await fetchData();
  };

  // Handle resolve comment
  const handleResolveComment = async (commentId: string, resolved: boolean) => {
    const res = await fetch(`/api/deliverables/${deliverableId}/timeline-comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved }),
    });
    if (!res.ok) throw new Error('Failed to resolve comment');
    await fetchData();
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    const res = await fetch(`/api/deliverables/${deliverableId}/timeline-comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete comment');
    await fetchData();
  };

  // Handle seek
  const handleSeek = useCallback((timestamp: number) => {
    setCurrentTime(timestamp);
  }, []);

  // Get status style
  const statusStyle = deliverable?.status ? statusColors[deliverable.status] : statusColors.DRAFT;

  // Get video URL
  const videoUrl = selectedVersion > 0 && versions[selectedVersion - 1]
    ? versions[selectedVersion - 1].fileUrl
    : deliverable?.fileUrl;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (error || !deliverable) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white/60 mb-4">{error || 'Deliverable not found'}</p>
        <button
          onClick={() => router.push('/portal')}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
        >
          Back to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#141414]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/portal')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </button>
            <div>
              <h1 className="text-white font-medium">{deliverable.name}</h1>
              <p className="text-sm text-white/40">
                {deliverable.project?.name} • {deliverable.project?.client?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
              {deliverable.status}
            </span>

            {/* Action Buttons */}
            {deliverable.status !== 'APPROVED' && deliverable.status !== 'COMPLETED' && (
              <>
                <button
                  onClick={handleRequestChanges}
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 
                    rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-medium"
                >
                  Request Changes
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 
                    rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium 
                    flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-black flex items-center justify-center">
            {videoUrl ? (
              <VideoPlayer
                src={videoUrl}
                poster={deliverable.thumbnailUrl}
                currentTime={currentTime}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
                markers={comments.map(c => ({
                  id: c.id,
                  timestamp: c.timestamp,
                  color: c.resolved ? '#3a86ff' : '#ff006e'
                }))}
                onMarkerClick={handleSeek}
                className="w-full h-full"
              />
            ) : (
              <div className="text-center p-8">
                <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No video available</p>
              </div>
            )}
          </div>

          {/* Bottom Toolbar */}
          <div className="bg-[#141414] border-t border-white/10 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/40">
                Version {selectedVersion || deliverable.version || 1}
              </span>
              <span className="text-sm text-white/40">•</span>
              <span className="text-sm text-white/40">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-white/10 bg-[#141414] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'comments' 
                  ? 'text-white border-b-2 border-[#ff006e]' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Comments ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'versions' 
                  ? 'text-white border-b-2 border-[#ff006e]' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Versions ({versions.length + 1})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'comments' ? (
            <TimelineComments
              comments={comments}
              currentTime={currentTime}
              duration={duration}
              onAddComment={handleAddComment}
              onResolveComment={handleResolveComment}
              onDeleteComment={handleDeleteComment}
              onSeek={handleSeek}
              currentUserId={user?.id || ''}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Version List */}
              <div className="space-y-3">
                {/* Current Version */}
                <button
                  onClick={() => setSelectedVersion(0)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedVersion === 0
                      ? 'bg-[#1a1a1a] border-[#ff006e]'
                      : 'bg-transparent border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Version {deliverable.version || 1}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {deliverable.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">Current version</p>
                </button>

                {/* Previous Versions */}
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version.versionNumber)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedVersion === version.versionNumber
                        ? 'bg-[#1a1a1a] border-[#ff006e]'
                        : 'bg-transparent border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Version {version.versionNumber}</span>
                      <span className="text-xs text-white/40">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {version.notes && (
                      <p className="text-xs text-white/60 line-clamp-2">{version.notes}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
