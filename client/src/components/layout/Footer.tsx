import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const SERVICE_LINKS = [
  { to: '/guards?serviceId=svc_personal', label: 'Personal Security' },
  { to: '/guards?serviceId=svc_event', label: 'Event Security' },
  { to: '/guards?serviceId=svc_residential', label: 'Residential Security' },
  { to: '/guards?serviceId=svc_commercial', label: 'Commercial Security' },
  { to: '/guards?serviceId=svc_night', label: 'Night Security' },
  { to: '/guards?serviceId=svc_corporate', label: 'Corporate Security' },
  { to: '/guards?serviceId=svc_supervisor', label: 'Security Supervisor' },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-brand-950 text-slate-300">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            The professional way to hire verified security guards and manage protection
            services — for people, homes, events and businesses.
          </p>
          <p className="mt-4 inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/30">
            Demo environment · sample data
          </p>
        </div>

        <nav aria-label="Services">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICE_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-slate-400 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Platform">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Platform</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/guards" className="text-slate-400 transition hover:text-white">Browse guards</Link></li>
            <li><Link to="/#how-it-works" className="text-slate-400 transition hover:text-white">How it works</Link></li>
            <li><Link to="/#trust" className="text-slate-400 transition hover:text-white">Trust &amp; safety</Link></li>
            <li><Link to="/#faq" className="text-slate-400 transition hover:text-white">FAQ</Link></li>
            <li><Link to="/register" className="text-slate-400 transition hover:text-white">Join as a guard</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-accent-500" aria-hidden />
              support@guardprovider.app
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-accent-500" aria-hidden />
              1800-000-0000 (demo)
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 shrink-0 text-accent-500" aria-hidden />
              Serving 8+ cities across India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Guard Provider. All rights reserved.</p>
          <p>Built as a full-stack demo — no real bookings are fulfilled.</p>
        </div>
      </div>
    </footer>
  );
}
