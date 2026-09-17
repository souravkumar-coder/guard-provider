import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import type { GuardListing, Paginated, Service } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { GuardCardSkeleton } from '@/components/ui/Skeleton';
import { GuardCard } from '@/components/guards/GuardCard';
import { GuardFilters } from '@/components/guards/GuardFilters';
import type { GuardFilterState } from '@/components/guards/GuardFilters';

export function GuardDirectory() {
  const [params, setParams] = useSearchParams();

  const filters: GuardFilterState = useMemo(
    () => ({
      search: params.get('search') ?? '',
      location: params.get('location') ?? '',
      serviceId: params.get('serviceId') ?? '',
      availability: params.get('availability') ?? '',
      minExperience: params.get('minExperience') ?? '0',
      verified: params.get('verified') === 'true',
      sort: params.get('sort') ?? 'rating',
    }),
    [params],
  );
  const page = Number(params.get('page') ?? '1');

  const debouncedSearch = useDebouncedValue(filters.search);
  const debouncedLocation = useDebouncedValue(filters.location);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch) qs.set('search', debouncedSearch);
    if (debouncedLocation) qs.set('location', debouncedLocation);
    if (filters.serviceId) qs.set('serviceId', filters.serviceId);
    if (filters.availability) qs.set('availability', filters.availability);
    if (filters.minExperience !== '0') qs.set('minExperience', filters.minExperience);
    if (filters.verified) qs.set('verified', 'true');
    if (filters.sort !== 'rating') qs.set('sort', filters.sort);
    qs.set('page', String(page));
    qs.set('limit', '9');
    return qs.toString();
  }, [debouncedSearch, debouncedLocation, filters, page]);

  const services = useApi(() => api.get<{ items: Service[] }>('/services'), []);
  const results = useApi(
    () => api.get<Paginated<GuardListing>>(`/guards?${queryString}`),
    [queryString],
  );

  const setFilters = (patch: Partial<GuardFilterState>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      const normalized = typeof value === 'boolean' ? String(value) : value;
      if (normalized === '' || normalized === 'false' || (key === 'minExperience' && normalized === '0') || (key === 'sort' && normalized === 'rating')) {
        next.delete(key);
      } else {
        next.set(key, normalized);
      }
    }
    if (!('page' in patch)) next.set('page', '1');
    setParams(next, { replace: true });
  };

  const setPage = (next: number) => {
    const updated = new URLSearchParams(params);
    updated.set('page', String(next));
    setParams(updated, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset transient page when filters change.
  useEffect(() => {
    if (params.get('page') && params.get('page') !== '1') {
      const updated = new URLSearchParams(params);
      updated.delete('page');
      setParams(updated, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.location !== '' ||
    filters.serviceId !== '' ||
    filters.availability !== '' ||
    filters.minExperience !== '0' ||
    filters.verified;

  return (
    <div className="bg-slate-50">
      <div className="bg-brand-950 py-12 text-white">
        <div className="container-app">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Find security professionals
          </h1>
          <p className="mt-2 max-w-xl text-slate-300">
            Browse verified guards by city, service type, experience and availability.
          </p>
        </div>
      </div>

      <div className="container-app grid gap-6 py-8 lg:grid-cols-[320px,1fr]">
        <aside>
          <GuardFilters
            value={filters}
            onChange={setFilters}
            services={services.data?.items ?? []}
          />
        </aside>

        <section aria-label="Search results">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {results.loading
                ? 'Searching…'
                : `${results.data?.total ?? 0} professional${(results.data?.total ?? 0) === 1 ? '' : 's'} found`}
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                Clear filters
              </Button>
            )}
          </div>

          {results.loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <GuardCardSkeleton key={i} />
              ))}
            </div>
          ) : results.error ? (
            <ErrorState message={results.error} onRetry={results.refetch} />
          ) : (results.data?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No guards match your filters"
              description="Try widening the location, removing the experience filter or searching a different service type."
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                    Reset all filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.data!.items.map((guard) => (
                  <GuardCard key={guard.id} guard={guard} services={services.data?.items ?? []} />
                ))}
              </div>
              <Pagination
                page={results.data!.page}
                totalPages={results.data!.totalPages}
                onChange={setPage}
                className="mt-8"
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
