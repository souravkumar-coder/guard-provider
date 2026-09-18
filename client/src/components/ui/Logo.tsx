import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  to?: string;
  size?: 'sm' | 'md';
  inverted?: boolean;
  className?: string;
}

export function Logo({ to = '/', size = 'md', inverted = false, className }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-900 text-accent-400 shadow-sm',
          size === 'md' ? 'size-9' : 'size-8',
        )}
      >
        <ShieldCheck className={size === 'md' ? 'size-5' : 'size-4.5'} aria-hidden />
      </span>
      <span
        className={cn(
          'font-display font-bold tracking-tight',
          size === 'md' ? 'text-lg' : 'text-base',
          inverted ? 'text-white' : 'text-brand-950',
        )}
      >
        Guard<span className="text-accent-500">Provider</span>
      </span>
    </span>
  );
  if (to) {
    return (
      <Link to={to} aria-label="Guard Provider home" className="rounded-lg">
        {content}
      </Link>
    );
  }
  return content;
}
