import { useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, Save } from 'lucide-react';
import type { AuthUser } from '@guard-provider/shared';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';

export function CustomerProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.customerProfile?.address ?? '');
  const [city, setCity] = useState(user?.customerProfile?.city ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Re-hydrate the form when the signed-in user object changes (React's
  // "adjust state during render" pattern instead of an effect).
  const [hydratedUser, setHydratedUser] = useState(user);
  if (user && user !== hydratedUser) {
    setHydratedUser(user);
    setName(user.name);
    setPhone(user.phone);
    setAddress(user.customerProfile?.address ?? '');
    setCity(user.customerProfile?.city ?? '');
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return toast.error('Enter your full name.');
    if (phone.trim().length < 7) return toast.error('Enter a valid phone number.');
    setSavingProfile(true);
    try {
      const updated = await api.patch<AuthUser>('/users/me', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      });
      setUser(updated);
      toast.success('Profile updated.');
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not save your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match.');
    setSavingPassword(true);
    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not change your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile & settings" description="Manage your account details and password." />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={saveProfile} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                </div>
                <Input
                  label="Address"
                  hint="Used as the default location when you send service requests."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                />
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
                <Button type="submit" icon={<Save className="size-4" />} loading={savingProfile}>
                  Save changes
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={savePassword} className="space-y-4" noValidate>
                <Input
                  label="Current password"
                  type="password"
                  icon={KeyRound}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    hint="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" loading={savingPassword}>
                  Update password
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <Card className="p-6 text-center lg:sticky lg:top-24">
          <Avatar name={user?.name ?? '?'} size="xl" className="mx-auto" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="mt-3 flex justify-center">
            <Badge variant="brand">Customer account</Badge>
          </div>
          <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-left text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Member since</dt>
              <dd className="font-semibold text-slate-800">
                {user ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">City</dt>
              <dd className="font-semibold text-slate-800">{user?.customerProfile?.city || '—'}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
