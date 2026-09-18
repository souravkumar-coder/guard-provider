import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, KeyRound, Mail, Phone, User, UserRound } from 'lucide-react';
import type { RegisterRole } from '@guard-provider/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { homePath } from '@/lib/utils';

const ROLE_OPTIONS: Array<{ role: RegisterRole; title: string; description: string; icon: typeof User }> = [
  {
    role: 'customer',
    title: 'Customer',
    description: 'Hire verified guards for personal, home, event or business security.',
    icon: UserRound,
  },
  {
    role: 'guard',
    title: 'Guard / Provider',
    description: 'Offer professional security services and manage requests & bookings.',
    icon: Briefcase,
  },
];

export function Register() {
  const { register: registerAccount } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<RegisterRole>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError('Enter your full name.');
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (phone.trim().length < 7) return setError('Enter a valid phone number.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      const user = await registerAccount({
        role,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      toast.success(
        role === 'guard'
          ? 'Account created! Complete your professional profile to appear in search.'
          : `Welcome to Guard Provider, ${user.name.split(' ')[0]}!`,
      );
      navigate(homePath(user.role), { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">Join as a customer or a security professional.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && <Alert variant="error" className="mb-5">{error}</Alert>}

          <fieldset className="mb-5">
            <legend className="mb-2 text-sm font-medium text-slate-700">I am joining as a…</legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((option) => {
                const active = role === option.role;
                return (
                  <button
                    key={option.role}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRole(option.role)}
                    className={cn(
                      'rounded-xl border p-3.5 text-left transition',
                      active
                        ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20'
                        : 'border-slate-200 bg-white hover:border-brand-300',
                    )}
                  >
                    <option.icon className={cn('size-5', active ? 'text-brand-700' : 'text-slate-400')} aria-hidden />
                    <span className="mt-2 block text-sm font-bold text-slate-900">{option.title}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-500">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              icon={User}
              autoComplete="name"
              placeholder="e.g. Anita Desai"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
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
                label="Phone"
                type="tel"
                icon={Phone}
                autoComplete="tel"
                placeholder="+91 98xxx xxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Password"
                type="password"
                icon={KeyRound}
                autoComplete="new-password"
                hint="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm password"
                type="password"
                icon={KeyRound}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth size="lg" loading={submitting}>
              Create {role === 'guard' ? 'guard' : 'customer'} account
            </Button>
            <p className="text-center text-xs leading-relaxed text-slate-400">
              Passwords are hashed with bcrypt before storage. This demo never shares your details.
            </p>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
