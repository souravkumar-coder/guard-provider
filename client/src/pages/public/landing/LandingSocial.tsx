import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronDown, Quote, Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/ui/RatingStars';
import { cn } from '@/lib/utils';

/* ── Testimonials (demo data) ─────────────────────────────── */

const TESTIMONIALS = [
  {
    name: 'Meera Kapoor',
    role: 'Cafe owner · Bengaluru',
    rating: 5,
    quote:
      'Finding a night guard used to take weeks of calls. On Guard Provider I compared profiles, sent a request and had a verified professional confirmed the same evening.',
  },
  {
    name: 'Col. R. Bhandari (Retd.)',
    role: 'Resident welfare secretary · Gurugram',
    rating: 5,
    quote:
      'The request-and-approval flow means our society always has a paper trail of who was booked, for when, and by whom. Exactly the discipline we wanted.',
  },
  {
    name: 'Sneha Trivedi',
    role: 'Event manager · Mumbai',
    rating: 4,
    quote:
      'I run 20+ events a year. Having guard profiles with experience, skills and real ratings in one dashboard has become part of my planning checklist.',
  },
];

export function Testimonials() {
  return (
    <section className="section-pad bg-white">
      <div className="container-app">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-accent-600">Testimonials</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              What early users say
            </h2>
          </div>
          <p className="rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            Demo data — shown for preview purposes
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <Quote className="size-6 text-brand-200" aria-hidden />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4">
                <Avatar name={t.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="truncate text-xs text-slate-500">{t.role}</p>
                </div>
                <RatingStars value={t.rating} className="ml-auto" />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'How do I know a guard is genuine?',
    a: 'Every professional profile displays a verification status. Admins review ID, address and experience documents before marking a guard verified — and you can filter search results to show verified guards only.',
  },
  {
    q: 'How does the request flow work?',
    a: 'You send a request with the service, date, duration, location and any special requirements. The guard reviews it and accepts or declines. Accepting automatically creates a booking that both sides can track.',
  },
  {
    q: 'Can I cancel a request or booking?',
    a: 'Yes. Pending requests can be cancelled anytime before the guard responds, and confirmed bookings can be cancelled by either side — the other party is notified instantly in-app.',
  },
  {
    q: 'How are ratings calculated?',
    a: 'Only customers with a completed booking can leave a review, and each booking can be reviewed once. A guard’s rating is the average across all their reviews.',
  },
  {
    q: 'I’m a security professional. How do I get started?',
    a: 'Register with the guard role, complete your professional profile (skills, experience, services, rates and service area) and submit it for verification. Verified profiles appear higher in customer search.',
  },
  {
    q: 'Is this a live commercial service?',
    a: 'This is a full-stack demo build with seeded sample data, so you can explore every workflow safely. No real guards are dispatched and no payments are processed.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-slate-900 sm:text-base">{q}</span>
        <ChevronDown
          className={cn('size-5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && <p className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-slate-600">{a}</p>}
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="section-pad bg-slate-50">
      <div className="container-app mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-accent-600">FAQ</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ──────────────────────────────────────────────── */

export function ContactSection() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || !email.includes('@') || message.trim().length < 10) {
      toast.error('Please fill in your name, a valid email and a short message.');
      return;
    }
    // Demo build: no backend transport is wired for contact messages.
    setSent(true);
    toast.info('Message captured locally — this demo build does not send email.');
  };

  return (
    <section id="contact" className="section-pad bg-white">
      <div className="container-app grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-accent-600">Contact</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Talk to Guard Provider
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-slate-600">
            Questions about hiring, verification or running a security team? Send us a note and
            we’ll point you in the right direction.
          </p>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-bold text-slate-900">Support</dt>
              <dd className="mt-0.5 text-slate-600">support@guardprovider.app</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">Guard onboarding</dt>
              <dd className="mt-0.5 text-slate-600">Join as a professional from the registration page.</dd>
            </div>
          </dl>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
            <p className="text-lg font-bold text-emerald-800">Thanks, {name.split(' ')[0]}!</p>
            <p className="mt-2 max-w-xs text-sm text-emerald-700">
              Your message was validated successfully. (Demo build — nothing was transmitted.)
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setSent(false);
                setName('');
                setEmail('');
                setMessage('');
              }}
            >
              Write another message
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-6" noValidate>
            <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
            <Button type="submit" icon={<Send className="size-4" />} className="justify-self-start">
              Send message
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
