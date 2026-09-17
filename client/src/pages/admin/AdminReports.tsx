import { Award, TrendingUp, UserPlus } from 'lucide-react';
import type { PlatformReport } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { RatingStars } from '@/components/ui/RatingStars';
import { RequestStatusBadge } from '@/components/ui/StatusBadge';
import { ListRowSkeleton } from '@/components/ui/Skeleton';

function BarList({ rows }: { rows: Array<{ label: string; value: number; badge?: React.ReactNode }> }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              {row.badge}
              {row.label}
            </span>
            <span className="text-sm font-bold text-slate-900">{row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
              style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminReports() {
  const report = useApi(() => api.get<PlatformReport>('/admin/reports'), []);

  return (
    <>
      <PageHeader title="Reports" description="Platform activity, demand by service and top performers." />

      {report.error ? (
        <ErrorState message={report.error} onRetry={report.refetch} />
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardIcon />
                Requests by status
              </CardTitle>
            </CardHeader>
            <CardBody>
              {report.loading ? (
                <ListRowSkeleton rows={4} />
              ) : (
                <BarList
                  rows={(['pending', 'accepted', 'rejected', 'cancelled'] as const).map((status) => ({
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    value: report.data?.requestsByStatus[status] ?? 0,
                    badge: <RequestStatusBadge status={status} />,
                  }))}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-brand-600" aria-hidden />
                Bookings by service type
              </CardTitle>
            </CardHeader>
            <CardBody>
              {report.loading ? (
                <ListRowSkeleton rows={4} />
              ) : (report.data?.bookingsByService.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">No bookings recorded yet.</p>
              ) : (
                <BarList
                  rows={(report.data?.bookingsByService ?? []).map((row) => ({
                    label: row.serviceName,
                    value: row.count,
                  }))}
                />
              )}
            </CardBody>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-4 text-brand-600" aria-hidden />
                Top rated guards
              </CardTitle>
            </CardHeader>
            <CardBody>
              {report.loading ? (
                <ListRowSkeleton rows={3} />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(report.data?.topGuards ?? []).map((guard, index) => (
                    <li key={guard.id} className="flex flex-wrap items-center gap-3 py-3.5">
                      <span className="font-display text-sm font-bold text-slate-300">#{index + 1}</span>
                      <Avatar name={guard.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{guard.name}</p>
                        <p className="text-xs text-slate-500">{guard.city}</p>
                      </div>
                      <RatingStars value={guard.rating} showValue />
                      <Badge variant="green">{guard.completedJobs} jobs</Badge>
                    </li>
                  ))}
                  {(report.data?.topGuards.length ?? 0) === 0 && (
                    <li className="py-6 text-center text-sm text-slate-500">No guard data yet.</li>
                  )}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-4 text-brand-600" aria-hidden />
                Growth
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-5 text-center">
                  <p className="font-display text-3xl font-bold text-brand-800">{report.data?.newUsersLast30Days ?? '…'}</p>
                  <p className="mt-1 text-sm text-slate-500">New users (last 30 days)</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-5 text-center">
                  <p className="font-display text-3xl font-bold text-brand-800">
                    {report.data ? Object.values(report.data.requestsByStatus).reduce((a, b) => a + b, 0) : '…'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Total service requests</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-5 text-center">
                  <p className="font-display text-3xl font-bold text-brand-800">
                    {report.data ? report.data.bookingsByService.reduce((a, b) => a + b.count, 0) : '…'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Total bookings</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-brand-600" aria-hidden>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
