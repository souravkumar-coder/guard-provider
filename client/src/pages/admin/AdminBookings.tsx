import { useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import type { BookingDto } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { ListRowSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatDuration } from '@/lib/utils';

const TAB_ITEMS = [
  { id: 'all', label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function AdminBookings() {
  const [tab, setTab] = useState('all');
  const { data, loading, error, refetch } = useApi(
    () => api.get<{ items: BookingDto[] }>('/admin/bookings'),
    [],
  );

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    const map: Record<string, number> = { all: items.length };
    for (const item of TAB_ITEMS.slice(1)) {
      map[item.id] = items.filter((b) => b.status === item.id).length;
    }
    return map;
  }, [data]);

  const filtered = useMemo(
    () => (tab === 'all' ? data?.items ?? [] : (data?.items ?? []).filter((b) => b.status === tab)),
    [data, tab],
  );

  return (
    <>
      <PageHeader title="Bookings" description="All bookings created from accepted requests." />
      <Tabs items={TAB_ITEMS.map((t) => ({ ...t, count: counts[t.id] }))} value={tab} onChange={setTab} className="mb-5" />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6"><ListRowSkeleton rows={4} /></div>
        ) : error ? (
          <div className="p-6"><ErrorState message={error} onRetry={refetch} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={CalendarCheck} title="No bookings found" description="Bookings appear here once guards accept requests." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Guard</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Service</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Scheduled</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Location</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{booking.customer.name}</td>
                    <td className="px-5 py-3.5 text-slate-700">{booking.guard.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="brand">{booking.service.name}</Badge>
                      <span className="ml-2 text-xs text-slate-400">{formatDuration(booking.durationHours)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(booking.scheduledDate)}</td>
                    <td className="max-w-[200px] truncate px-5 py-3.5 text-slate-600">{booking.location}</td>
                    <td className="px-5 py-3.5"><BookingStatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
