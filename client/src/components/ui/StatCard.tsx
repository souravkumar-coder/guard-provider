import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'brand' | 'green' | 'amber' | 'red' | 'sky';

const TONES: Record<Tone, { iconWrap: string; value: string }> = {
  brand: { iconWrap: 'bg-brand-50 text-brand-700', value: 'text-brand-900' },
  green: { iconWrap: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700' },
  amber: { iconWrap: 'bg-amber-50 text-amber-600', value: 'text-amber-700' },
  red: { iconWrap: 'bg-red-50 text-red-600', value: 'text-red-700' },
  sky: { iconWrap: 'bg-sky-50 text-sky-600', value: 'text-sky-700' },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, tone = 'brand', hint, className }: StatCardProps) {
  const t = TONES[tone];
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', t.iconWrap)}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className={cn('mt-2 font-display text-3xl font-bold tracking-tight', t.value)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
