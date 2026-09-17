import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { GuardListing, Service } from '@guard-provider/shared';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { todayIso } from '@/lib/utils';
import { DURATION_OPTIONS } from '@/lib/constants';

const requestSchema = z.object({
  serviceId: z.string().min(1, 'Choose a service type'),
  requestedDate: z.string().min(1, 'Choose a date'),
  durationHours: z.string().min(1, 'Select a duration'),
  location: z.string().trim().min(4, 'Enter where the service is needed'),
  requirements: z.string().trim().max(1000, 'Keep it under 1000 characters').optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

interface RequestServiceModalProps {
  guard: GuardListing;
  services: Service[];
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
}

export function RequestServiceModal({ guard, services, open, onClose, onSent }: RequestServiceModalProps) {
  const toast = useToast();
  const guardServices = useMemo(
    () => services.filter((s) => guard.serviceIds.includes(s.id)),
    [services, guard.serviceIds],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      serviceId: guardServices[0]?.id ?? '',
      requestedDate: todayIso(),
      durationHours: '8',
      location: '',
      requirements: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await api.post('/requests', {
        guardId: guard.id,
        serviceId: values.serviceId,
        requestedDate: values.requestedDate,
        durationHours: Number(values.durationHours),
        location: values.location,
        requirements: values.requirements ?? '',
      });
      toast.success(`Request sent to ${guard.user.name}. Track its status under My Requests.`);
      reset();
      onSent?.();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error('Could not send the request. Please try again.');
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request service"
      description={`Send a service request to ${guard.user.name}`}
      size="lg"
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <Avatar name={guard.user.name} size="md" src={guard.user.avatarUrl} />
        <div>
          <p className="text-sm font-bold text-slate-900">{guard.user.name}</p>
          <p className="text-xs text-slate-500">
            {guard.title} · ₹{guard.hourlyRate}/hr · {guard.experienceYears}+ yrs
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Select
          label="Service type"
          error={errors.serviceId?.message}
          {...register('serviceId')}
        >
          {guardServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Input
          label="Service date"
          type="date"
          min={todayIso()}
          error={errors.requestedDate?.message}
          {...register('requestedDate')}
        />
        <Select
          label="Duration"
          error={errors.durationHours?.message}
          {...register('durationHours')}
        >
          {DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Input
          label="Location"
          placeholder="e.g. Worli, Mumbai"
          error={errors.location?.message}
          {...register('location')}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Special requirements (optional)"
            placeholder="Describe the assignment, timing, dress code, number of posts…"
            error={errors.requirements?.message}
            {...register('requirements')}
          />
        </div>
        <div className="flex justify-end gap-2.5 sm:col-span-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Send request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
