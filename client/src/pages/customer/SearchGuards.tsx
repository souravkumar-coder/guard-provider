import { useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import type { GuardListing, Paginated, Service } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { GuardCardSkeleton } from '@/components/ui/Skeleton';
import { GuardCard } from '@/components/guards/GuardCard';
import { EMPTY_GUARD_FILTERS, GuardFilters } from '@/components/guards/GuardFilters';
import type { GuardFilterState } from '@/components/guards/GuardFilters';

const PAGE_SIZE = 9;

export function SearchGuards() {
  const [filters, setFiltersState] = useState<GuardFilterState>(EMPTY_GUARD_FILTERS);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(filters.search);
  const debouncedLocation = useDebouncedValue(filters.location);

  const setFilters = (patch: Partial<GuardFilterState>) => {
    setFiltersState((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch) qs.set('search', debouncedSearch);
    if (debouncedLocation) qs.set('location', debouncedLocation);
    if (filters.serviceId) qs.set('serviceId', filters.serviceId);
    if (filters.availability) qs.set('availability', filters.availability);
    if (filters.minExperience !== '0') qs.set('minExperience', filters.minExperience);
    if (filters.verified) qs.set('verified', 'true');
    qs.set('sort', filters.sort);
    qs.set('page', String(page));
    qs.set('limit', String(PAGE_SIZE));
    return qs.toString();
  }, [debouncedSearch, debouncedLocation, filters, page]);

  const services = useApi(() => api.get<{ items: Service[] }>('/services'), []);
  const results = useApi(
    () => api.get<Paginated<GuardListing>>(`/guards?${queryString}`),
    [queryString],
  );

  return (
    <>
      <PageHeader
        title="Find guards"
        description="Search verified security professionals and send a service request."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[300px,1fr]">
        <GuardFilters
          value={filters}
          onChange={setFilters}
          services={services.data?.items ?? []}
        />

        <section aria-label="Search results">
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
              description="Try a different city, remove the experience filter, or include unverified profiles."
              action={
                <Button variant="secondary" onClick={() => setFiltersState(EMPTY_GUARD_FILTERS)}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                {results.data!.total} professional{results.data!.total === 1 ? '' : 's'} found
              </p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.data!.items.map((guard) => (
                  <GuardCard key={guard.id} guard={guard} services={services.data?.items ?? []} />
                ))}
              </div>
              <Pagination
                page={results.data!.page}
                totalPages={results.data!.totalPages}
                onChange={(next) => setPage(next)}
                className="mt-8"
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
