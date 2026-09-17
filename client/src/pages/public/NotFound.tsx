import { Link } from 'react-router-dom';
import { Home, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <ShieldQuestion className="size-8" aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-5xl font-extrabold text-brand-950">404</h1>
      <p className="mt-2 text-lg font-bold text-slate-900">This page is off duty</p>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button icon={<Home className="size-4" />}>Back to home</Button>
      </Link>
    </div>
  );
}
