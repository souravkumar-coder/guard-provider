import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, MapPin, Search, ShieldCheck, Star } from 'lucide-react';
import type { Service } from '@guard-provider/shared';
import { Button } from '@/components/ui/Button';

interface LandingHeroProps {
  services: Service[];
}

export function LandingHero({ services }: LandingHeroProps) {
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState('');
  const [location, setLocation] = useState('');

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (serviceId) params.set('serviceId', serviceId);
    if (location.trim()) params.set('location', location.trim());
    navigate(`/guards${params.size > 0 ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden bg-brand-950 text-white">
      {/* subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(53,96,155,0.45), transparent 40%), radial-gradient(circle at 85% 10%, rgba(231,158,27,0.14), transparent 35%), radial-gradient(circle at 60% 100%, rgba(53,96,155,0.3), transparent 45%)',
        }}
      />
      <div className="container-app relative py-20 sm:py-28">
        <div className="max-w-2xl animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-accent-300 ring-1 ring-inset ring-white/15">
            <ShieldCheck className="size-3.5" aria-hidden />
            Verified guards · Transparent ratings · Direct requests
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Professional security,
            <span className="text-accent-400"> on demand.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            Guard Provider connects you with experienced, verified security professionals — for
            your family, home, event or business. Request a guard in minutes, track every
            booking in one place.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl shadow-brand-950/40 sm:flex-row sm:items-center"
            aria-label="Search security services"
          >
            <label className="flex flex-1 items-center gap-2 border-b border-slate-100 px-2 py-2 sm:border-b-0 sm:border-r">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span className="sr-only">Service type</span>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
              >
                <option value="">All security services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 items-center gap-2 px-2 py-2">
              <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
              <span className="sr-only">Location</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or area, e.g. Mumbai"
                className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </label>
            <Button type="submit" size="lg" className="shrink-0">
              Find guards
            </Button>
          </form>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
            {[
              { label: 'Guard profiles', value: '500+' },
              { label: 'Cities covered', value: '8+' },
              { label: 'Avg. rating', value: '4.7' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{stat.label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Floating trust card */}
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 xl:block">
          <div className="w-72 rotate-2 rounded-2xl bg-white p-5 text-slate-800 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgeCheck className="size-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold">Verified professionals</p>
                <p className="text-xs text-slate-500">ID &amp; background checked</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Star className="size-6 fill-amber-400" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold">Real ratings</p>
                <p className="text-xs text-slate-500">Only completed jobs can be reviewed</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <ShieldCheck className="size-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold">Full control</p>
                <p className="text-xs text-slate-500">Accept, track &amp; manage requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
