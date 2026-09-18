import { Link } from 'react-router-dom';
import {
  BellRing,
  ClipboardCheck,
  CalendarCheck,
  Search,
  ShieldCheck,
  Star,
  UserPlus,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import type { Service } from '@guard-provider/shared';
import { ServiceIcon } from '@/components/icons/ServiceIcon';
import { Skeleton } from '@/components/ui/Skeleton';

/* ── Service categories ───────────────────────────────────── */

export function ServiceCategories({ services, loading }: { services: Service[]; loading: boolean }) {
  return (
    <section id="services" className="section-pad bg-white">
      <div className="container-app">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-accent-600">Services</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Protection for every situation
          </h2>
          <p className="mt-3 text-slate-600">
            From close personal protection to overnight industrial watch — find trained
            professionals for each kind of assignment.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/guards?serviceId=${service.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-800 group-hover:text-accent-400">
                  <ServiceIcon icon={service.icon} className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{service.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{service.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-800">
                  Find professionals
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────── */

const CUSTOMER_STEPS = [
  {
    icon: Search,
    title: 'Search & compare',
    description: 'Filter verified guards by city, service type, availability, experience and ratings.',
  },
  {
    icon: FileText,
    title: 'Send a request',
    description: 'Pick the date, duration and location, add your requirements and send the request.',
  },
  {
    icon: CalendarCheck,
    title: 'Track your booking',
    description: 'The guard accepts and a booking is created — follow its status until completion.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad bg-slate-50">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-accent-600">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Book a guard in three steps
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {CUSTOMER_STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="absolute -top-3.5 left-6 flex size-7 items-center justify-center rounded-full bg-accent-500 font-display text-sm font-bold text-brand-950">
                {index + 1}
              </span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <step.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 rounded-2xl bg-brand-950 p-6 text-center sm:flex-row sm:text-left">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-400">
            <UserPlus className="size-5" aria-hidden />
          </span>
          <p className="flex-1 text-sm leading-relaxed text-slate-300">
            <span className="font-bold text-white">Are you a security professional?</span> Create a
            free profile, get discovered by customers and manage requests, availability and
            bookings from your own dashboard.
          </p>
          <Link
            to="/register"
            className="shrink-0 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-bold text-brand-950 transition hover:bg-accent-400"
          >
            Join as a guard
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Trust & safety ───────────────────────────────────────── */

const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    title: 'Verified identities',
    description: 'Guard profiles go through an admin verification review with ID and experience documents.',
  },
  {
    icon: ClipboardCheck,
    title: 'Experience you can check',
    description: 'Years of service, skills and service areas are listed on every professional profile.',
  },
  {
    icon: Star,
    title: 'Honest reviews',
    description: 'Only customers with a completed booking can leave a rating — no fake reviews.',
  },
  {
    icon: ShieldCheck,
    title: 'You stay in control',
    description: 'Requests, acceptances and cancellations are explicit — nothing is booked without your confirmation.',
  },
];

function TrustIcon({ icon: Icon }: { icon: typeof Star }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

export function TrustSection() {
  return (
    <section id="trust" className="section-pad bg-white">
      <div className="container-app grid items-start gap-12 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24">
          <p className="text-sm font-bold uppercase tracking-wider text-accent-600">Trust &amp; safety</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Security starts with who you trust
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            Inviting someone to protect your people and property is a serious decision. Guard
            Provider is built around verifiable profiles, transparent history and clear
            request-and-approval workflows — so you always know exactly who is coming and why.
          </p>
          <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
            <p className="text-sm font-bold text-brand-900">Every guard profile shows</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {['Verification status', 'Years of experience', 'Skills & languages', 'Ratings from completed jobs', 'Availability & service area'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {TRUST_POINTS.map((point) => (
            <li key={point.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <TrustIcon icon={point.icon} />
              <h3 className="mt-3.5 font-bold text-slate-900">{point.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{point.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Platform features ────────────────────────────────────── */

const FEATURES = [
  {
    icon: Search,
    title: 'Powerful search & filters',
    description: 'Find the right professional by location, service, experience, availability and verification.',
  },
  {
    icon: FileText,
    title: 'Request & approval flow',
    description: 'Clear request lifecycle: pending → accepted or rejected → booking → completed.',
  },
  {
    icon: CalendarCheck,
    title: 'Booking tracking',
    description: 'Both sides see upcoming, completed and cancelled bookings with full history.',
  },
  {
    icon: BellRing,
    title: 'Real-time notifications',
    description: 'In-app alerts for new requests, responses, booking updates and account changes.',
  },
  {
    icon: UserPlus,
    title: 'Guard workspaces',
    description: 'Professionals manage their profile, skills, rates, availability and incoming work.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin oversight',
    description: 'Verification management, platform statistics and full request/booking visibility.',
  },
];

export function FeaturesSection() {
  return (
    <section className="section-pad bg-slate-50">
      <div className="container-app">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-accent-600">Platform</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything both sides need
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-800 text-accent-400">
                <feature.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
