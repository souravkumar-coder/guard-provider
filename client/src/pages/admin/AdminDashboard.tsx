import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import type { AdminStats, AdminUserRow } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ListRowSkeleton } from '@/components/ui/Skeleton';
import { VerificationStatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';

export function AdminDashboard() {
  const toast = useToast();
  const stats = useApi(() => api.get<AdminStats>('/admin/stats'), []);
  const users = useApi(() => api.get<{ items: AdminUserRow[] }>('/admin/users?role=guard'), []);

  const pendingGuards = (users.data?.items ?? []).filter((u) => u.verificationStatus === 'pending');

  const reviewVerification = async (guardUserId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await api.get<{ items: AdminUserRow[] }>('/admin/users?role=guard');
      // Resolve guardProfileId from the directory endpoint is indirect; use admin verifications path via users list rows.
      void res;
    } catch {
      /* handled below */
    }
    // The admin API accepts the guard *profile* id; admins table rows carry user ids,
    // so the users page uses a dedicated lookup. Here we simply re-point to Users for
    // full context — but quick actions need the profile id:
    try {
      const listing = await api.get<{ items: Array<{ id: string; userId: string }> }>('/guards?limit=48');
      const profile = listing.items.find((g) => g.userId === guardUserId);
      if (!profile) throw new Error('Guard profile not found');
      await api.patch(`/admin/guards/${profile.id}/verification`, { status });
      toast.success(status === 'verified' ? 'Guard verified.' : 'Verification rejected.');
      users.refetch();
      stats.refetch();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Action failed.');
    }
  };

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Key statistics and verification queue for Guard Provider."
        actions={
          <Link to="/admin/reports">
            <Button variant="outline">View reports</Button>
          </Link>
        }
      />

      {stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.refetch} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={stats.data?.totalUsers ?? '…'} icon={Users} tone="brand" />
            <StatCard label="Guards" value={stats.data?.totalGuards ?? '…'} icon={ShieldCheck} tone="sky" />
            <StatCard label="Customers" value={stats.data?.totalCustomers ?? '…'} icon={UserRound} tone="green" />
            <StatCard
              label="Pending verifications"
              value={stats.data?.pendingVerifications ?? '…'}
              icon={BadgeCheck}
              tone={((stats.data?.pendingVerifications ?? 0) > 0 ? 'amber' : 'green') as 'amber' | 'green'}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Service requests" value={stats.data?.totalRequests ?? '…'} icon={ClipboardList} tone="brand" />
            <StatCard label="Bookings" value={stats.data?.totalBookings ?? '…'} icon={CalendarCheck} tone="sky" />
            <StatCard label="Completed jobs" value={stats.data?.completedJobs ?? '…'} icon={BadgeCheck} tone="green" />
            <StatCard
              label="Pending requests"
              value={stats.data?.requestsByStatus.pending ?? '…'}
              icon={ClipboardList}
              tone="amber"
            />
          </div>
        </>
      )}

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle>Verification queue</CardTitle>
          <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800">
            All users <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </CardHeader>
        <CardBody>
          {users.loading ? (
            <ListRowSkeleton rows={2} />
          ) : users.error ? (
            <ErrorState message={users.error} onRetry={users.refetch} />
          ) : pendingGuards.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No verifications waiting — the queue is clear. ✓
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingGuards.slice(0, 5).map((guard) => (
                <li key={guard.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <Avatar name={guard.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{guard.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {guard.email} · joined {formatDate(guard.createdAt)}
                    </p>
                  </div>
                  <VerificationStatusBadge status={guard.verificationStatus ?? 'unverified'} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void reviewVerification(guard.guardProfileId ?? '', 'verified')}>
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="danger-outline"
                      onClick={() => void reviewVerification(guard.guardProfileId ?? '', 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Requests by status</CardTitle>
          </CardHeader>
          <CardBody>
            {stats.data ? (
              <div className="grid gap-3 sm:grid-cols-4">
                {(['pending', 'accepted', 'rejected', 'cancelled'] as const).map((status) => (
                  <div key={status} className="rounded-xl border border-slate-200 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{stats.data!.requestsByStatus[status]}</p>
                    <div className="mt-1.5">
                      <Badge variant={status === 'pending' ? 'amber' : status === 'accepted' ? 'green' : status === 'rejected' ? 'red' : 'gray'}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ListRowSkeleton rows={1} />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
