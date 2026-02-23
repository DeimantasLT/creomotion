'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  currentTime?: number;
  className?: string;
  markers?: Array<{
    timestamp: number;
    color: string;
    id: string;
  }>;
  onMarkerClick?: (timestamp: number) => void;
}

// Format time as MM:SS:FF (frames at 30fps)
function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const frames = Math.floor((timeInSeconds % 1) * 30); // Assuming 30fps
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

function formatTimeSimple(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function VideoPlayer({
  src,
  poster,
  onTimeUpdate,
  onDurationChange,
  currentTime: externalCurrentTime,
  className = '',
  markers = [],
  onMarkerClick
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Update internal time when external time changes
  useEffect(() => {
    if (externalCurrentTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = externalCurrentTime;
    }
  }, [externalCurrentTime]);

  const updateProgress = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      const buf = videoRef.current.buffered.length > 0 
        ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1) 
        : 0;
      
      setCurrentTime(time);
      setBuffered(buf);
      setDuration(dur || 0);
      onTimeUpdate?.(time);
      onDurationChange?.(dur || 0);
    }
  }, [onTimeUpdate, onDurationChange]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(async () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const skipTime = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      updateProgress();
    }
  }, [updateProgress]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(5);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipTime, toggleFullscreen, toggleMute]);

  // Calculate marker positions
  const markerPositions = markers.map(marker => ({
    ...marker,
    position: duration > 0 ? (marker.timestamp / duration) * 100 : 0
  }));

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#0a0a0a] overflow-hidden group ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={updateProgress}
        onLoadedMetadata={updateProgress}
        onClick={togglePlay}
        playsInline
      />

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
          transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Timeline / Progress Bar */}
        <div className="px-4 pt-6 pb-2">
          <div
            ref={progressRef}
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
            onClick={handleSeek}
          >
            {/* Buffered Progress */}
            <div
              className="absolute h-full bg-white/30 rounded-full"
              style={{ width: `${duration > 0 ? (buffered / duration) * 100 : 0}%` }}
            />
            
            {/* Play Progress */}
            <div
              className="absolute h-full bg-gradient-to-r from-[#ff006e] to-[#8338ec] rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Scrub Handle */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 
                bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>

            {/* Comment Markers */}
            {markerPositions.map((marker) => (
              <div
                key={marker.id}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-3 rounded-sm cursor-pointer 
                  hover:scale-125 transition-transform z-10"
                style={{
                  left: `${marker.position}%`,
                  backgroundColor: marker.color,
                  transform: 'translateX(-50%) translateY(-50%)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkerClick?.(marker.timestamp);
                }}
                title={`Jump to ${formatTimeSimple(marker.timestamp)}`}
              />
            ))}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center rounded-full 
                bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            {/* Skip Back/Forward */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => skipTime(-5)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipBack className="w-4 h-4 text-white/80" />
              </button>
              <button
                onClick={() => skipTime(5)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipForward className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* Time Display */}
            <div className="font-mono text-sm text-white/80">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white/80" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-2
                  [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-moz-range-thumb]:w-2
                  [&::-moz-range-thumb]:h-2
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border-none
                  opacity-0 group-hover/volume:opacity-100 transition-opacity"
              />
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-white/80" />
              ) : (
                <Maximize className="w-4 h-4 text-white/80" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button (shown when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-20 h-20 flex items-center justify-center
            bg-gradient-to-r from-[#ff006e] to-[#8338ec]
            rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          <Play className="w-8 h-8 text-white ml-1" />
        </button>
      )}
    </div>
  );
}
