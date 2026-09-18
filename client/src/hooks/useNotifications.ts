import { useCallback, useEffect, useState } from 'react';
import type { AppNotification } from '@guard-provider/shared';
import { api } from '@/lib/api';

interface NotificationsState {
  items: AppNotification[];
  unread: number;
}

/**
 * Polls the notifications endpoint while the user is signed in so the bell
 * badge stays fresh without websockets (swap in later if needed).
 */
export function useNotifications(enabled: boolean) {
  const [state, setState] = useState<NotificationsState>({ items: [], unread: 0 });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await api.get<NotificationsState>('/notifications');
      setState(res);
    } catch {
      /* polling errors are non-fatal — the next tick retries */
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      // Clear asynchronously so state updates stay out of the effect body.
      void Promise.resolve().then(() => setState({ items: [], unread: 0 }));
      return;
    }
    // Defer the initial poll to a microtask (initial load behaves the same).
    void Promise.resolve().then(() => void refresh());
    const interval = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(interval);
  }, [enabled, refresh]);

  const markRead = useCallback(
    async (notificationId: string) => {
      try {
        await api.patch(`/notifications/${notificationId}/read`);
        void refresh();
      } catch {
        /* ignore */
      }
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      void refresh();
    } catch {
      /* ignore */
    }
  }, [refresh]);

  return { ...state, refresh, markRead, markAllRead };
}
