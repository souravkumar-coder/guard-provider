import { Search, SlidersHorizontal } from 'lucide-react';
import type { Service } from '@guard-provider/shared';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EXPERIENCE_OPTIONS, AVAILABILITY_FILTER_OPTIONS, SORT_OPTIONS } from '@/lib/constants';

export interface GuardFilterState {
  search: string;
  location: string;
  serviceId: string;
  availability: string;
  minExperience: string;
  verified: boolean;
  sort: string;
}

export const EMPTY_GUARD_FILTERS: GuardFilterState = {
  search: '',
  location: '',
  serviceId: '',
  availability: '',
  minExperience: '0',
  verified: false,
  sort: 'rating',
};

interface GuardFiltersProps {
  value: GuardFilterState;
  onChange: (patch: Partial<GuardFilterState>) => void;
  services: Service[];
}

export function GuardFilters({ value, onChange, services }: GuardFiltersProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
        <SlidersHorizontal className="size-4 text-brand-600" aria-hidden />
        Search &amp; filters
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Input
          label="Keyword"
          icon={Search}
          placeholder="Name, skill, title…"
          value={value.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
        <Input
          label="Location"
          placeholder="City or area"
          value={value.location}
          onChange={(e) => onChange({ location: e.target.value })}
        />
        <Select
          label="Service type"
          value={value.serviceId}
          onChange={(e) => onChange({ serviceId: e.target.value })}
        >
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          label="Availability"
          value={value.availability}
          onChange={(e) => onChange({ availability: e.target.value })}
        >
          {AVAILABILITY_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          label="Experience"
          value={value.minExperience}
          onChange={(e) => onChange({ minExperience: e.target.value })}
        >
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select label="Sort by" value={value.sort} onChange={(e) => onChange({ sort: e.target.value })}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={value.verified}
            onChange={(e) => onChange({ verified: e.target.checked })}
            className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Verified guards only
        </label>
      </div>
    </Card>
  );
}
