import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { DEMO_ACCOUNTS, DEMO_PASSWORD_HINT } from '@/lib/constants';
import { homePath } from '@/lib/utils';

const ROLE_BY_EMAIL: Record<string, string> = {
  'anita.desai@demo.in': 'Customer',
  'vikram.rathore@demo.in': 'Guard',
  'admin@guardprovider.demo': 'Admin',
};

export function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.includes('@') || password.length < 1) {
      setError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(from ?? homePath(user.role), { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD_HINT);
    setError(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to your customer, guard or admin account.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && <Alert variant="error" className="mb-5">{error}</Alert>}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              icon={KeyRound}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth size="lg" loading={submitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            New to Guard Provider?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-800">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-brand-900">
            <ShieldCheck className="size-4" aria-hidden />
            Demo accounts
          </p>
          <p className="mt-1 text-xs text-brand-800/80">
            Explore each role instantly — password is <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">{DEMO_PASSWORD_HINT}</code>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => quickFill(account.email)}
                className="rounded-xl border border-brand-200 bg-white px-2 py-2.5 text-center transition hover:border-brand-400 hover:shadow-sm"
              >
                <span className="block text-xs font-bold text-slate-800">{account.roleLabel}</span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-400">{ROLE_BY_EMAIL[account.email] ?? 'Demo'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
