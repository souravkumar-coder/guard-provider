import type { AppNotification, NotificationType } from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import { ApiError } from '../utils/errors.js';

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Internal helper used across services — every meaningful event in the
 * request/booking lifecycle produces an in-app notification.
 */
export function pushNotification(input: NotifyInput): Promise<AppNotification> {
  return dataSource.notifications.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
    read: false,
  });
}

export const notificationsService = {
  async list(userId: string): Promise<{ items: AppNotification[]; unread: number }> {
    const [items, unread] = await Promise.all([
      dataSource.notifications.listByUser(userId),
      dataSource.notifications.countUnread(userId),
    ]);
    return { items, unread };
  },

  async unreadCount(userId: string): Promise<number> {
    return dataSource.notifications.countUnread(userId);
  },

  async markRead(userId: string, notificationId: string): Promise<AppNotification> {
    const notification = await dataSource.notifications.markRead(userId, notificationId);
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  },

  async markAllRead(userId: string): Promise<void> {
    await dataSource.notifications.markAllRead(userId);
  },
};
