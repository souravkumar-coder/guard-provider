import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block size-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600',
        className,
      )}
    />
  );
}

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3">
      <Spinner className="size-8" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
