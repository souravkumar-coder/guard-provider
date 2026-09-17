import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  Search,
} from 'lucide-react';
import type { BookingDto, GuardListing, Paginated, ServiceRequestDto, Service } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListRowSkeleton } from '@/components/ui/Skeleton';
import { RequestCard } from '@/components/requests/RequestCard';
import { GuardCard } from '@/components/guards/GuardCard';

export function CustomerDashboard() {
  const { user } = useAuth();

  const requests = useApi(() => api.get<{ items: ServiceRequestDto[] }>('/requests/mine'), []);
  const bookings = useApi(() => api.get<{ items: BookingDto[] }>('/bookings/mine'), []);
  const services = useApi(() => api.get<{ items: Service[] }>('/services'), []);
  const recommended = useApi(
    () => api.get<Paginated<GuardListing>>('/guards?verified=true&limit=3'),
    [],
  );

  const pendingCount = requests.data?.items.filter((r) => r.status === 'pending').length ?? 0;
  const activeBookings = bookings.data?.items.filter((b) => b.status === 'confirmed').length ?? 0;
  const completedBookings = bookings.data?.items.filter((b) => b.status === 'completed').length ?? 0;
  const recentRequests = requests.data?.items.slice(0, 3) ?? [];
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening with your security requests and bookings."
        actions={
          <Link to="/dashboard/search">
            <Button icon={<Search className="size-4" />}>Find a guard</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending requests" value={pendingCount} icon={ClipboardList} tone="amber" hint="Waiting for guard response" />
        <StatCard label="Active bookings" value={activeBookings} icon={CalendarCheck} tone="sky" hint="Confirmed & upcoming" />
        <StatCard label="Completed services" value={completedBookings} icon={CheckCircle2} tone="green" hint="Finished assignments" />
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle>Recent requests</CardTitle>
            <Link to="/dashboard/requests" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800">
              View all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </CardHeader>
          <CardBody>
            {requests.loading ? (
              <ListRowSkeleton rows={2} />
            ) : requests.error ? (
              <ErrorState message={requests.error} onRetry={requests.refetch} />
            ) : recentRequests.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <Clock className="mx-auto size-6 text-slate-300" aria-hidden />
                <p className="mt-2 text-sm text-slate-500">No requests yet — find a guard to get started.</p>
                <Link to="/dashboard/search" className="mt-3 inline-block">
                  <Button size="sm" variant="secondary">Browse guards</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <RequestCard key={request.id} request={request} perspective="customer" onChanged={requests.refetch} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle>Top rated guards</CardTitle>
            <Link to="/dashboard/search" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800">
              Browse all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {recommended.loading ? (
              <ListRowSkeleton rows={2} />
            ) : recommended.error ? (
              <ErrorState message={recommended.error} onRetry={recommended.refetch} />
            ) : (
              (recommended.data?.items ?? []).slice(0, 2).map((guard) => (
                <GuardCard key={guard.id} guard={guard} services={services.data?.items ?? []} />
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
