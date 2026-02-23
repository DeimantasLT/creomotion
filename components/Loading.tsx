"use client";

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ text = 'Loading...', size = 'md' }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className={`${sizes[size]} border-2 border-white/20 border-t-[#ff006e] rounded-full animate-spin`} />
      {text && <p className="text-white/60 font-mono text-sm">{text}</p>}
    </div>
  );
}

// Skeleton loader for cards
export function SkeletonCard() {
  return (
    <div className="p-6 border border-white/10 bg-[#141414] animate-pulse">
      <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
      <div className="h-6 bg-white/10 rounded w-2/3 mb-2" />
      <div className="h-4 bg-white/10 rounded w-full" />
    </div>
  );
}

// Skeleton for tables
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
      ))}
    </div>
  );
}

// Full page loading
export function PageLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loading text="Loading page..." size="lg" />
    </div>
  );
}

export default Loading;
