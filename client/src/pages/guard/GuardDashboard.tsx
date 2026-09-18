import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  FileText,
  Star,
} from 'lucide-react';
import type { BookingDto, GuardProfile, ServiceRequestDto } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { ListRowSkeleton } from '@/components/ui/Skeleton';
import { RequestCard } from '@/components/requests/RequestCard';
import { VERIFICATION_STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function GuardDashboard() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const profile = useApi(() => api.get<GuardProfile>('/guards/me/profile'), [user?.id]);
  const requests = useApi(() => api.get<{ items: ServiceRequestDto[] }>('/requests/incoming'), [user?.id]);
  const bookings = useApi(() => api.get<{ items: BookingDto[] }>('/bookings/mine'), [user?.id]);

  const pending = requests.data?.items.filter((r) => r.status === 'pending') ?? [];
  const upcoming = bookings.data?.items.filter((b) => b.status === 'confirmed') ?? [];
  const guardProfile = profile.data;
  const verification = guardProfile ? VERIFICATION_STATUS_META[guardProfile.verificationStatus] : null;

  const completeness = guardProfile
    ? [
        { done: !!guardProfile.title, label: 'Professional title' },
        { done: guardProfile.about.length >= 30, label: 'About section (30+ chars)' },
        { done: !!guardProfile.city, label: 'Base city' },
        { done: !!guardProfile.serviceArea, label: 'Service area' },
        { done: guardProfile.skills.length > 0, label: 'At least one skill' },
        { done: guardProfile.serviceIds.length > 0, label: 'Service types selected' },
      ]
    : [];
  const completedCount = completeness.filter((c) => c.done).length;
  const completionPct = Math.round((completedCount / Math.max(completeness.length, 1)) * 100);

  const changeAvailability = async (value: string) => {
    if (!guardProfile) return;
    try {
      const updated = await api.patch<GuardProfile>('/guards/me/profile', {
        availability: value as GuardProfile['availability'],
      });
      profile.setData(updated);
      if (user?.guardProfile) setUser({ ...user, guardProfile: updated });
      toast.success('Availability updated.');
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not update availability.');
    }
  };

  const submitForVerification = async () => {
    try {
      const updated = await api.post<GuardProfile>('/guards/me/submit-verification');
      profile.setData(updated);
      if (user?.guardProfile) setUser({ ...user, guardProfile: updated });
      toast.success('Submitted for verification — admins will review your profile.');
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not submit for verification.');
    }
  };

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name.split(' ')[0] ?? 'guard'}`}
        description="Your incoming work, bookings and profile health at a glance."
        actions={
          guardProfile && (
            <Link to={`/guards/${guardProfile.id}`}>
              <Button variant="outline">View public profile</Button>
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New requests" value={pending.length} icon={FileText} tone="amber" hint="Awaiting your response" />
        <StatCard label="Upcoming bookings" value={upcoming.length} icon={CalendarCheck} tone="sky" hint="Confirmed assignments" />
        <StatCard
          label="Rating"
          value={guardProfile && guardProfile.rating > 0 ? guardProfile.rating.toFixed(1) : 'New'}
          icon={Star}
          tone="brand"
          hint={`${guardProfile?.reviewCount ?? 0} reviews`}
        />
        <StatCard label="Completed jobs" value={guardProfile?.completedJobs ?? 0} icon={Briefcase} tone="green" hint="All time" />
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle>Incoming requests</CardTitle>
            <Link to="/guard/requests" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800">
              View all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </CardHeader>
          <CardBody>
            {requests.loading ? (
              <ListRowSkeleton rows={2} />
            ) : requests.error ? (
              <ErrorState message={requests.error} onRetry={requests.refetch} />
            ) : pending.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                No new requests right now. Keep your profile complete and availability on — customers
                are browsing.
              </div>
            ) : (
              <div className="space-y-3">
                {pending.slice(0, 2).map((request) => (
                  <RequestCard key={request.id} request={request} perspective="guard" onChanged={requests.refetch} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardBody>
              <Select
                aria-label="Availability status"
                value={guardProfile?.availability ?? 'available'}
                onChange={(e) => void changeAvailability(e.target.value)}
              >
                <option value="available">Available now</option>
                <option value="on_duty">On duty</option>
                <option value="unavailable">Unavailable</option>
              </Select>
              <p className="mt-2 text-xs text-slate-500">
                “Unavailable” hides you from customer search results.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <CardTitle>Profile strength</CardTitle>
              {verification && <Badge variant={verification.variant}>{verification.label}</Badge>}
            </CardHeader>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      completionPct >= 80 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-amber-500' : 'bg-red-400',
                    )}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-800">{completionPct}%</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {completeness.map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
                    ) : (
                      <CircleDashed className="size-4 shrink-0 text-slate-300" aria-hidden />
                    )}
                    <span className={item.done ? 'text-slate-500 line-through/0' : 'text-slate-700'}>{item.label}</span>
                  </li>
                ))}
              </ul>
              {guardProfile &&
                (guardProfile.verificationStatus === 'unverified' || guardProfile.verificationStatus === 'rejected') && (
                  <Button variant="secondary" fullWidth className="mt-4" onClick={() => void submitForVerification()}>
                    Submit for verification
                  </Button>
                )}
              {guardProfile?.verificationStatus === 'pending' && (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                  Your verification is awaiting admin review.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
