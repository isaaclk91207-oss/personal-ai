interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClass = 'bg-bg-surface-light rounded-lg animate-pulse';
  const variantClass = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    rect: 'rounded-2xl',
  };

  return (
    <div
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-4 p-4 animate-fade-in">
      <Skeleton variant="circle" width={32} height={32} className="flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-6">
      <MessageSkeleton />
      <div className="flex justify-end">
        <div className="flex gap-4 max-w-[80%]">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton variant="circle" width={32} height={32} className="flex-shrink-0" />
        </div>
      </div>
      <MessageSkeleton />
    </div>
  );
}
