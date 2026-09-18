import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Save, ShieldCheck } from 'lucide-react';
import type { AuthUser, GuardProfile, Service } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { FullPageLoader } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { TagInput } from '@/components/ui/TagInput';
import { Textarea } from '@/components/ui/Textarea';
import { VERIFICATION_STATUS_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

const SKILL_SUGGESTIONS = [
  'Close Protection',
  'Crowd Control',
  'Access Control',
  'CCTV Monitoring',
  'Night Patrol',
  'First Aid',
  'Fire Safety',
  'Defensive Driving',
  'Loss Prevention',
  'Gate Management',
];

const LANGUAGE_SUGGESTIONS = ['Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Kannada', 'Bengali', 'Punjabi', 'Urdu', 'Gujarati'];

interface ProfileForm {
  name: string;
  phone: string;
  title: string;
  about: string;
  city: string;
  serviceArea: string;
  experienceYears: string;
  hourlyRate: string;
  availability: GuardProfile['availability'];
  skills: string[];
  languages: string[];
  serviceIds: string[];
}

export function GuardProfileEditor() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const profile = useApi(() => api.get<GuardProfile>('/guards/me/profile'), [user?.id]);
  const services = useApi(() => api.get<{ items: Service[] }>('/services'), []);

  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Hydrate the editable form from the fetched profile once (React's
  // "adjust state during render" pattern instead of an effect).
  const [hydratedProfileId, setHydratedProfileId] = useState<string | null>(null);
  const fetchedProfile = profile.data;
  if (fetchedProfile && hydratedProfileId !== fetchedProfile.id) {
    setHydratedProfileId(fetchedProfile.id);
    setForm({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      title: fetchedProfile.title,
      about: fetchedProfile.about,
      city: fetchedProfile.city,
      serviceArea: fetchedProfile.serviceArea,
      experienceYears: String(fetchedProfile.experienceYears),
      hourlyRate: String(fetchedProfile.hourlyRate),
      availability: fetchedProfile.availability,
      skills: fetchedProfile.skills,
      languages: fetchedProfile.languages,
      serviceIds: fetchedProfile.serviceIds,
    });
  }

  if (profile.loading) return <FullPageLoader label="Loading your profile…" />;
  if (profile.error || !profile.data) {
    return <ErrorState message={profile.error ?? 'Profile not found.'} onRetry={profile.refetch} />;
  }

  const patch = (p: Partial<ProfileForm>) => setForm((f) => (f ? { ...f, ...p } : f));
  const verification = VERIFICATION_STATUS_META[profile.data.verificationStatus];

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    if (form.title.trim().length < 3) return toast.error('Enter a professional title.');
    if (form.city.trim().length < 2) return toast.error('Enter your base city.');
    if (form.serviceIds.length === 0) return toast.error('Select at least one service type.');
    const experience = Number(form.experienceYears);
    const rate = Number(form.hourlyRate);
    if (!Number.isFinite(experience) || experience < 0 || experience > 60)
      return toast.error('Enter valid years of experience (0–60).');
    if (!Number.isFinite(rate) || rate < 50) return toast.error('Enter an hourly rate of at least ₹50.');

    setSaving(true);
    try {
      const updated = await api.patch<GuardProfile>('/guards/me/profile', {
        title: form.title.trim(),
        about: form.about.trim(),
        city: form.city.trim(),
        serviceArea: form.serviceArea.trim(),
        experienceYears: Math.round(experience),
        hourlyRate: Math.round(rate),
        availability: form.availability,
        skills: form.skills,
        languages: form.languages,
        serviceIds: form.serviceIds,
      });
      profile.setData(updated);
      if (user) setUser({ ...(user as AuthUser), guardProfile: updated });
      toast.success('Professional profile saved.');
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const submitForVerification = async () => {
    setSubmittingVerification(true);
    try {
      const updated = await api.post<GuardProfile>('/guards/me/submit-verification');
      profile.setData(updated);
      if (user) setUser({ ...(user as AuthUser), guardProfile: updated });
      toast.success('Submitted for verification — admins will review your profile.');
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not submit for verification.');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const toggleService = (serviceId: string) => {
    if (!form) return;
    patch({
      serviceIds: form.serviceIds.includes(serviceId)
        ? form.serviceIds.filter((id) => id !== serviceId)
        : [...form.serviceIds, serviceId],
    });
  };

  return (
    <>
      <PageHeader
        title="My professional profile"
        description="This is what customers see when they find you in search."
        actions={
          <Link to={`/guards/${profile.data.id}`}>
            <Button variant="outline" icon={<ExternalLink className="size-4" />}>
              View public profile
            </Button>
          </Link>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr,340px]">
        {form && (
          <Card>
            <CardHeader>
              <CardTitle>Professional information</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={save} className="space-y-5" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Professional title"
                    placeholder="e.g. Executive Personal Protection Officer"
                    value={form.title}
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                  <Select
                    label="Availability"
                    value={form.availability}
                    onChange={(e) => patch({ availability: e.target.value as GuardProfile['availability'] })}
                  >
                    <option value="available">Available now</option>
                    <option value="on_duty">On duty</option>
                    <option value="unavailable">Unavailable</option>
                  </Select>
                </div>

                <Textarea
                  label="About you"
                  rows={5}
                  placeholder="Your background, training, the kind of assignments you excel at…"
                  value={form.about}
                  onChange={(e) => patch({ about: e.target.value })}
                  hint={`${form.about.length}/1200 characters`}
                  maxLength={1200}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Base city" placeholder="e.g. Mumbai" value={form.city} onChange={(e) => patch({ city: e.target.value })} />
                  <Input
                    label="Service area"
                    placeholder="e.g. Mumbai, Navi Mumbai, Thane"
                    value={form.serviceArea}
                    onChange={(e) => patch({ serviceArea: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Years of experience"
                    type="number"
                    min={0}
                    max={60}
                    value={form.experienceYears}
                    onChange={(e) => patch({ experienceYears: e.target.value })}
                  />
                  <Input
                    label="Hourly rate (₹)"
                    type="number"
                    min={50}
                    step={10}
                    value={form.hourlyRate}
                    onChange={(e) => patch({ hourlyRate: e.target.value })}
                  />
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-700">Service types</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(services.data?.items ?? []).map((service) => {
                      const checked = form.serviceIds.includes(service.id);
                      return (
                        <label
                          key={service.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-sm transition',
                            checked ? 'border-brand-500 bg-brand-50 font-semibold text-brand-900' : 'border-slate-200 hover:border-brand-300',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleService(service.id)}
                            className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          {service.name}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <TagInput
                  id="skills"
                  label="Skills"
                  value={form.skills}
                  onChange={(skills) => patch({ skills })}
                  suggestions={SKILL_SUGGESTIONS}
                  placeholder="Type a skill and press Enter"
                  hint="Press Enter or click Add. Suggestions appear as you type."
                />
                <TagInput
                  id="languages"
                  label="Languages"
                  value={form.languages}
                  onChange={(languages) => patch({ languages })}
                  suggestions={LANGUAGE_SUGGESTIONS}
                  placeholder="Type a language and press Enter"
                />

                <Button type="submit" icon={<Save className="size-4" />} loading={saving}>
                  Save profile
                </Button>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Verification side card */}
        <div className="space-y-6 xl:sticky xl:top-24">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <ShieldCheck className="size-4.5 text-brand-600" aria-hidden />
                Verification
              </h2>
              <Badge variant={verification.variant}>{verification.label}</Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {profile.data.verificationStatus === 'verified' &&
                'Your profile is verified. Verified guards rank higher in customer search and get a trust badge on their profile.'}
              {profile.data.verificationStatus === 'pending' &&
                'Your verification request is queued for admin review. You’ll get a notification once it is reviewed.'}
              {profile.data.verificationStatus === 'rejected' &&
                'Your last verification request was not approved. Update your profile and submit again.'}
              {profile.data.verificationStatus === 'unverified' &&
                'Get a trust badge and rank higher in search by submitting your profile for admin verification.'}
            </p>
            {(profile.data.verificationStatus === 'unverified' || profile.data.verificationStatus === 'rejected') && (
              <Button
                variant="secondary"
                fullWidth
                className="mt-4"
                loading={submittingVerification}
                onClick={() => void submitForVerification()}
              >
                Submit for verification
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900">Account snapshot</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Rating</dt>
                <dd className="font-semibold text-slate-800">
                  {profile.data.rating > 0 ? `${profile.data.rating.toFixed(1)} ★` : 'No reviews yet'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Reviews</dt>
                <dd className="font-semibold text-slate-800">{profile.data.reviewCount}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Completed jobs</dt>
                <dd className="font-semibold text-slate-800">{profile.data.completedJobs}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Profile created</dt>
                <dd className="font-semibold text-slate-800">
                  {new Date(profile.data.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
              Ratings are calculated automatically from verified customer reviews on completed
              bookings.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
