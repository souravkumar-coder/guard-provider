import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import type { RequestStatus, ServiceRequestDto } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { RequestStatusBadge } from '@/components/ui/StatusBadge';
import { ListRowSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatDuration } from '@/lib/utils';

const TAB_ITEMS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function AdminRequests() {
  const [tab, setTab] = useState('all');
  const { data, loading, error, refetch } = useApi(
    () => api.get<{ items: ServiceRequestDto[] }>('/admin/requests'),
    [],
  );

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    const map: Record<string, number> = { all: items.length };
    for (const item of TAB_ITEMS.slice(1)) {
      map[item.id] = items.filter((r) => r.status === (item.id as RequestStatus)).length;
    }
    return map;
  }, [data]);

  const filtered = useMemo(
    () => (tab === 'all' ? data?.items ?? [] : (data?.items ?? []).filter((r) => r.status === tab)),
    [data, tab],
  );

  return (
    <>
      <PageHeader title="Service requests" description="Every request sent between customers and guards." />
      <Tabs items={TAB_ITEMS.map((t) => ({ ...t, count: counts[t.id] }))} value={tab} onChange={setTab} className="mb-5" />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6"><ListRowSkeleton rows={4} /></div>
        ) : error ? (
          <div className="p-6"><ErrorState message={error} onRetry={refetch} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={ClipboardList} title="No requests found" description="Requests will appear here as customers and guards interact." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Guard</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Service</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Location</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((request) => (
                  <tr key={request.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{request.customer.name}</td>
                    <td className="px-5 py-3.5 text-slate-700">{request.guard.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="brand">{request.service.name}</Badge>
                      <span className="ml-2 text-xs text-slate-400">{formatDuration(request.durationHours)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(request.requestedDate)}</td>
                    <td className="max-w-[200px] truncate px-5 py-3.5 text-slate-600">{request.location}</td>
                    <td className="px-5 py-3.5"><RequestStatusBadge status={request.status} /></td>
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
