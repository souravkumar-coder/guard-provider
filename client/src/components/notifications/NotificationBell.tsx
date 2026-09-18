import { useEffect, useRef, useState } from 'react';
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

export function NotificationBell() {
  const { user } = useAuth();
  const { items, unread, markRead, markAllRead } = useNotifications(!!user);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-fade-up sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-slate-500">
                <BellRing className="mx-auto mb-2 size-6 text-slate-300" aria-hidden />
                You're all caught up.
              </li>
            )}
            {items.slice(0, 8).map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? Bell;
              return (
                <li key={item.id}>
                  <Link
                    to={item.link ?? '/notifications'}
                    onClick={() => {
                      if (!item.read) void markRead(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex gap-3 px-4 py-3 transition hover:bg-slate-50',
                      !item.read && 'bg-brand-50/60',
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-800">{item.title}</span>
                        <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(item.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-500">
                        {item.message}
                      </span>
                    </span>
                    {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-brand-600 hover:bg-slate-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
