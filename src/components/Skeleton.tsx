"use client";

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
}

export function Skeleton({ className = "", lines = 1, height = "h-4", width = "w-full" }: SkeletonProps) {
  if (lines === 1) {
    return (
      <div className={`animate-pulse bg-dark-700/50 rounded ${height} ${width} ${className}`} />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-dark-700/50 rounded ${height} ${
            i === lines - 1 ? "w-3/4" : width
          }`}
        />
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Other user message skeleton */}
      <div className="flex justify-start">
        <div className="max-w-[85%] sm:max-w-xs">
          <div className="flex items-start justify-between mb-2 gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="bg-gradient-to-r from-secondary-500/20 to-secondary-600/20 rounded-2xl px-4 py-3">
            <Skeleton lines={2} className="h-3" />
          </div>
        </div>
      </div>
      
      {/* Your message skeleton */}
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-xs">
          <div className="flex items-start justify-between mb-2 gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl px-4 py-3">
            <Skeleton lines={1} className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatControlsSkeleton() {
  return (
    <div className="card card-elevated">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-20 sm:w-24" />
          <Skeleton className="h-10 w-20 sm:w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
