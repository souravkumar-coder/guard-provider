import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import type { BookingDto, BookingStatus } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListRowSkeleton } from '@/components/ui/Skeleton';
import { BookingCard } from '@/components/bookings/BookingCard';

const TAB_ITEMS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All' },
];

function matchesTab(booking: BookingDto, tab: string): boolean {
  if (tab === 'all') return true;
  if (tab === 'active') return booking.status === 'confirmed';
  return booking.status === (tab as BookingStatus);
}

export function MyBookings() {
  const [tab, setTab] = useState('active');
  const { data, loading, error, refetch } = useApi(
    () => api.get<{ items: BookingDto[] }>('/bookings/mine'),
    [],
  );

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    return {
      active: items.filter((b) => b.status === 'confirmed').length,
      completed: items.filter((b) => b.status === 'completed').length,
      cancelled: items.filter((b) => b.status === 'cancelled').length,
      all: items.length,
    };
  }, [data]);

  const filtered = useMemo(() => (data?.items ?? []).filter((b) => matchesTab(b, tab)), [data, tab]);

  return (
    <>
      <PageHeader title="Bookings" description="Confirmed assignments, service history and reviews." />
      <Tabs
        items={TAB_ITEMS.map((t) => ({ ...t, count: counts[t.id as keyof typeof counts] }))}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />

      {loading ? (
        <ListRowSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        tab === 'active' ? (
          <EmptyState
            icon={CalendarCheck}
            title="No active bookings"
            description="When a guard accepts your request, the booking shows up here."
            action={
              <Link to="/dashboard/search">
                <Button>Find a guard</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState icon={CalendarCheck} title="Nothing here yet" description="Bookings with this status will appear here." />
        )
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} perspective="customer" onChanged={refetch} />
          ))}
        </div>
      )}
    </>
  );
}
