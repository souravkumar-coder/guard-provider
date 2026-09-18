import { Link } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CalendarCheck,
  CheckCheck,
  FileText,
  ShieldCheck,
  Star,
  UserRound,
  XCircle,
} from 'lucide-react';
import type { NotificationType } from '@guard-provider/shared';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  request_new: FileText,
  request_accepted: CheckCheck,
  request_rejected: XCircle,
  booking_update: CalendarCheck,
  review_new: Star,
  account_update: UserRound,
  verification_update: ShieldCheck,
};

export function NotificationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { items, unread, markRead, markAllRead } = useNotifications(!!user);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread notification${unread === 1 ? '' : 's'}` : 'You’re all caught up.'}
        actions={
          unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void markAllRead();
                toast.success('All notifications marked as read.');
              }}
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No notifications yet"
          description="Request updates, booking changes and account alerts will land here."
          action={
            <Link to="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? Bell;
            return (
              <li key={item.id}>
                <div
                  className={cn(
                    'flex gap-3.5 rounded-2xl border p-4 transition',
                    item.read ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/60',
                  )}
                >
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <span className="shrink-0 text-xs text-slate-400">{timeAgo(item.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.message}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      {item.link && (
                        <Link to={item.link} onClick={() => !item.read && void markRead(item.id)} className="text-sm font-semibold text-brand-600 hover:text-brand-800">
                          Open →
                        </Link>
                      )}
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => void markRead(item.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  {!item.read && <span className="mt-1 size-2.5 shrink-0 rounded-full bg-brand-500" aria-hidden />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
