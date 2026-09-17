import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import type { GuardListing, Service } from '@guard-provider/shared';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatRate } from '@/lib/utils';
import { AVAILABILITY_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface GuardCardProps {
  guard: GuardListing;
  services: Service[];
}

export function GuardCard({ guard, services }: GuardCardProps) {
  const availability = AVAILABILITY_META[guard.availability];
  const serviceNames = guard.serviceIds
    .map((id) => services.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <Avatar name={guard.user.name} size="lg" src={guard.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-bold text-slate-900">{guard.user.name}</h3>
            {guard.verificationStatus === 'verified' && (
              <BadgeCheck className="size-4.5 shrink-0 text-emerald-500" aria-label="Verified guard" />
            )}
          </div>
          <p className="truncate text-sm text-slate-500">{guard.title || 'Security Professional'}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {guard.city || 'India'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              <strong className="text-slate-700">{guard.rating > 0 ? guard.rating.toFixed(1) : 'New'}</strong>
              {guard.reviewCount > 0 && <span>({guard.reviewCount})</span>}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={cn('size-2 rounded-full', availability.dot)} aria-hidden />
              {availability.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200">
          {guard.experienceYears}+ yrs experience
        </span>
        {serviceNames.map((name) => (
          <span key={name} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {name}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <p className="text-sm font-bold text-slate-900">
          {formatRate(guard.hourlyRate)}
        </p>
        <Link to={`/guards/${guard.id}`}>
          <Button size="sm" variant="secondary">
            View profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
