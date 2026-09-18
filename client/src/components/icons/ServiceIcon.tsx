import { BadgeCheck, Building2, CalendarCheck, Home, MoonStar, ShieldCheck, Store, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'user-shield': UserRound,
  'calendar-shield': CalendarCheck,
  'home-shield': Home,
  'store-shield': Store,
  'moon-shield': MoonStar,
  'building-shield': Building2,
  'badge-shield': BadgeCheck,
};

interface ServiceIconProps {
  icon: string;
  className?: string;
}

/** Maps a service's `icon` key from the API to a lucide icon. */
export function ServiceIcon({ icon, className }: ServiceIconProps) {
  const Icon = ICONS[icon] ?? ShieldCheck;
  return <Icon className={className} aria-hidden />;
}
