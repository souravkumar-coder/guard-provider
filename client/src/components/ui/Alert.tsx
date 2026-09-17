import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'error' | 'info' | 'success';

const STYLES: Record<AlertVariant, { icon: typeof Info; classes: string }> = {
  error: { icon: AlertTriangle, classes: 'border-red-200 bg-red-50 text-red-700' },
  info: { icon: Info, classes: 'border-brand-200 bg-brand-50 text-brand-800' },
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
};

export function Alert({
  variant = 'info',
  className,
  children,
}: {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}) {
  const { icon: Icon, classes } = STYLES[variant];
  return (
    <div role="alert" className={cn('flex items-start gap-2.5 rounded-xl border p-3.5 text-sm', classes, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
