import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import type { RequestStatus, ServiceRequestDto } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListRowSkeleton } from '@/components/ui/Skeleton';
import { RequestCard } from '@/components/requests/RequestCard';

const TAB_ITEMS = [
  { id: 'pending', label: 'New' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Declined' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All' },
];

export function GuardRequests() {
  const [tab, setTab] = useState('pending');
  const { data, loading, error, refetch } = useApi(
    () => api.get<{ items: ServiceRequestDto[] }>('/requests/incoming'),
    [],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: data?.items.length ?? 0 };
    for (const item of TAB_ITEMS.slice(0, 4)) {
      map[item.id] = data?.items.filter((r) => r.status === (item.id as RequestStatus)).length ?? 0;
    }
    return map;
  }, [data]);

  const filtered = useMemo(
    () => (tab === 'all' ? data?.items ?? [] : data?.items.filter((r) => r.status === tab) ?? []),
    [data, tab],
  );

  return (
    <>
      <PageHeader
        title="Incoming requests"
        description="Accept a request to instantly create a booking, or decline with a reason."
      />
      <Tabs items={TAB_ITEMS.map((t) => ({ ...t, count: counts[t.id] }))} value={tab} onChange={setTab} className="mb-5" />

      {loading ? (
        <ListRowSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={tab === 'pending' ? 'No new requests' : `No ${tab} requests`}
          description="Customer requests for your services will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((request) => (
            <RequestCard key={request.id} request={request} perspective="guard" onChanged={refetch} />
          ))}
        </div>
      )}
    </>
  );
}
