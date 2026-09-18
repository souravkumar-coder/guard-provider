import { clsx, type ClassValue } from 'clsx';
import type { UserRole } from '@guard-provider/shared';

/** Merge conditional class names. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(seconds)) return '—';
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatRate(hourlyRate: number): string {
  return `₹${hourlyRate.toLocaleString('en-IN')}/hr`;
}

export function formatDuration(hours: number): string {
  return hours === 1 ? '1 hour' : `${hours} hours`;
}

export function todayIso(): string {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Where each role lands after signing in. */
export function homePath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'guard':
      return '/guard';
    default:
      return '/dashboard';
  }
}

export function isFutureDate(iso: string): boolean {
  const today = new Date(todayIso()).getTime();
  return new Date(iso).getTime() >= today;
}
