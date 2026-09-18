import { useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@guard-provider/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import type { ServiceRequestDto } from '@guard-provider/shared';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Show a live pending count for guard requests. */
  pendingCount?: boolean;
}

type RenderableNavItem = NavItem & { badge?: number };

const NAV: Record<UserRole, NavItem[]> = {
  customer: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/search', label: 'Find Guards', icon: Search },
    { to: '/dashboard/requests', label: 'My Requests', icon: FileText },
    { to: '/dashboard/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/dashboard/profile', label: 'Profile & Settings', icon: Settings },
  ],
  guard: [
    { to: '/guard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/guard/requests', label: 'Incoming Requests', icon: FileText, pendingCount: true },
    { to: '/guard/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/guard/profile', label: 'My Profile', icon: ShieldCheck },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
    { to: '/admin/bookings', label: 'Bookings', icon: Building2 },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
  ],
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const role = user?.role ?? 'customer';

  const pending = useApi(
    () => (role === 'guard' ? api.get<{ items: ServiceRequestDto[] }>('/requests/incoming') : Promise.resolve({ items: [] })),
    [role],
  );
  const pendingCount = useMemo(
    () => pending.data?.items.filter((r) => r.status === 'pending').length ?? 0,
    [pending.data],
  );

  const items: RenderableNavItem[] = NAV[role].map((item) =>
    item.pendingCount ? { ...item, badge: pendingCount } : item,
  );

  const sidebar = (
    <div ref={sidebarRef} className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Logo to={role === 'customer' ? '/dashboard' : role === 'guard' ? '/guard' : '/admin'} size="sm" />
      </div>
      <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="size-4.5 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {!!badge && badge > 0 && (
              <span className="rounded-full bg-accent-500 px-1.5 py-0.5 text-[11px] font-bold text-brand-950">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name ?? 'User'} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-xs capitalize text-slate-400">{role} account</p>
          </div>
          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={() => {
              logout();
              toast.info('You have been signed out.');
              navigate('/');
            }}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className="fixed inset-0 bg-slate-950/50 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl animate-fade-in">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className={cn('fixed inset-0 z-10 hidden')}
          >
            <X className="hidden" />
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1">
            <Avatar name={user?.name ?? 'User'} size="sm" />
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">{user?.name}</span>
          </div>
        </header>

        <main className="container-app py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
