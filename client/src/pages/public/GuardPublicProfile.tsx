import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Languages,
  MapPin,
  ShieldQuestion,
  Star,
  Wrench,
} from 'lucide-react';
import type { GuardListing, ReviewWithCustomer, Service } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { FullPageLoader } from '@/components/ui/Spinner';
import { RatingStars } from '@/components/ui/RatingStars';
import { RequestServiceModal } from '@/components/guards/RequestServiceModal';
import { AVAILABILITY_META, VERIFICATION_STATUS_META } from '@/lib/constants';
import { formatRate, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function GuardPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requestOpen, setRequestOpen] = useState(false);

  const guard = useApi(
    () => api.get<GuardListing>(`/guards/${id ?? ''}`),
    [id],
  );
  const reviews = useApi(
    () => api.get<{ items: ReviewWithCustomer[] }>(`/guards/${id ?? ''}/reviews`),
    [id],
  );
  const services = useApi(() => api.get<{ items: Service[] }>('/services'), []);

  const guardServices = useMemo(
    () => (services.data?.items ?? []).filter((s) => guard.data?.serviceIds.includes(s.id)),
    [services.data, guard.data],
  );

  if (guard.loading) return <FullPageLoader label="Loading profile…" />;
  if (guard.error || !guard.data) {
    return (
      <div className="container-app py-16">
        <ErrorState
          message={guard.error ?? 'This guard profile does not exist or is no longer available.'}
          onRetry={guard.refetch}
        />
        <div className="mt-6 text-center">
          <Link to="/guards">
            <Button variant="outline" icon={<ArrowLeft className="size-4" />}>
              Back to directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const g = guard.data;
  const availability = AVAILABILITY_META[g.availability];
  const verification = VERIFICATION_STATUS_META[g.verificationStatus];
  const canRequest = !user || user.role === 'customer';

  const onRequest = () => {
    if (!user) {
      navigate('/login', { state: { from: `/guards/${g.id}` } });
      return;
    }
    setRequestOpen(true);
  };

  return (
    <div className="bg-slate-50">
      <div className="container-app py-8">
        <Link to="/guards" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-700">
          <ArrowLeft className="size-4" aria-hidden />
          All guards
        </Link>

        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr,360px]">
          {/* Main column */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700" />
              <div className="-mt-10 px-6 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    <div className="rounded-full ring-4 ring-white">
                      <Avatar name={g.user.name} size="xl" src={g.user.avatarUrl} />
                    </div>
                    <div className="pb-1">
                      <div className="flex items-center gap-2">
                        <h1 className="font-display text-2xl font-bold text-slate-900">{g.user.name}</h1>
                        {g.verificationStatus === 'verified' && (
                          <BadgeCheck className="size-5 text-emerald-500" aria-label="Verified" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{g.title || 'Security Professional'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pb-1">
                    <Badge variant={verification.variant}>{verification.label}</Badge>
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', availability.variant === 'green' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : availability.variant === 'amber' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-slate-200')}>
                      <span className={cn('size-2 rounded-full', availability.dot)} aria-hidden />
                      {availability.label}
                    </span>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <dt className="text-xs font-medium text-slate-500">Experience</dt>
                    <dd className="mt-0.5 text-lg font-bold text-slate-900">{g.experienceYears}+ yrs</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <dt className="text-xs font-medium text-slate-500">Rating</dt>
                    <dd className="mt-0.5 flex items-center gap-1 text-lg font-bold text-slate-900">
                      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                      {g.rating > 0 ? g.rating.toFixed(1) : 'New'}
                      <span className="text-xs font-medium text-slate-400">({g.reviewCount})</span>
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <dt className="text-xs font-medium text-slate-500">Completed jobs</dt>
                    <dd className="mt-0.5 text-lg font-bold text-slate-900">{g.completedJobs}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <dt className="text-xs font-medium text-slate-500">Hourly rate</dt>
                    <dd className="mt-0.5 text-lg font-bold text-slate-900">{formatRate(g.hourlyRate)}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900">About</h2>
              <p className="mt-2.5 leading-relaxed text-slate-600">
                {g.about || 'This professional has not added a bio yet.'}
              </p>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Wrench className="size-4 text-brand-600" aria-hidden />
                  Skills
                </h2>
                {g.skills.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {g.skills.map((skill) => (
                      <li key={skill} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200">
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No skills listed yet.</p>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <ShieldQuestion className="size-4 text-brand-600" aria-hidden />
                  Service types
                </h2>
                {guardServices.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {guardServices.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <BadgeCheck className="size-4 shrink-0 text-emerald-500" aria-hidden />
                        {s.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No service types selected yet.</p>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <MapPin className="size-4 text-brand-600" aria-hidden />
                  Service area
                </h2>
                <p className="mt-2.5 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Base city:</span> {g.city || '—'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Covers:</span> {g.serviceArea || g.city || '—'}
                </p>
              </Card>

              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Languages className="size-4 text-brand-600" aria-hidden />
                  Languages
                </h2>
                {g.languages.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {g.languages.map((lang) => (
                      <li key={lang} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {lang}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Not specified.</p>
                )}
              </Card>
            </div>

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">Ratings &amp; reviews</h2>
                <RatingStars value={g.rating} showValue />
              </div>
              {reviews.loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading reviews…</p>
              ) : (reviews.data?.items.length ?? 0) === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  No reviews yet — be the first to share your experience after a completed booking.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {reviews.data!.items.map((review) => (
                    <li key={review.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={review.customer.name} size="sm" src={review.customer.avatarUrl} />
                          <p className="text-sm font-semibold text-slate-800">{review.customer.name}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <RatingStars value={review.rating} />
                          <span className="text-xs text-slate-400">{timeAgo(review.createdAt)}</span>
                        </div>
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Sticky action card */}
          <aside className="lg:sticky lg:top-24">
            <Card className="p-6">
              <p className="font-display text-2xl font-bold text-slate-900">
                {formatRate(g.hourlyRate)}
              </p>
              <p className="text-sm text-slate-500">Hourly rate · negotiable for long postings</p>

              {canRequest ? (
                <Button fullWidth size="lg" className="mt-5" onClick={onRequest}>
                  {user ? 'Request service' : 'Sign in to request'}
                </Button>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 p-3.5 text-center text-sm text-slate-500">
                  Guards can’t send requests — switch to a customer account to book.
                </p>
              )}

              <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CalendarClock className="size-4 shrink-0 text-brand-600" aria-hidden />
                  Responds through his dashboard
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="size-4 shrink-0 text-brand-600" aria-hidden />
                  {g.verificationStatus === 'verified' ? 'Identity verified by admins' : 'Verification ' + verification.label.toLowerCase()}
                </li>
                <li className="flex items-center gap-2">
                  <Star className="size-4 shrink-0 text-brand-600" aria-hidden />
                  {g.completedJobs} completed jobs on record
                </li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>

      {guard.data && (
        <RequestServiceModal
          guard={guard.data}
          services={services.data?.items ?? []}
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
        />
      )}
    </div>
  );
}
