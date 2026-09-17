import { useMemo, useState } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import type { AdminUserRow } from '@guard-provider/shared';
import { useApi } from '@/hooks/useApi';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { VerificationStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

const TAB_ITEMS = [
  { id: '', label: 'All' },
  { id: 'guard', label: 'Guards' },
  { id: 'customer', label: 'Customers' },
  { id: 'admin', label: 'Admins' },
];

interface VerificationTarget {
  row: AdminUserRow;
  status: 'verified' | 'rejected';
}

export function AdminUsers() {
  const toast = useToast();
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState<VerificationTarget | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const users = useApi(
    () =>
      api.get<{ items: AdminUserRow[] }>(
        `/admin/users?${new URLSearchParams({
          ...(role ? { role } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        }).toString()}`,
      ),
    [role, debouncedSearch],
  );

  const counts = useMemo(() => {
    const items = users.data?.items ?? [];
    return {
      '': items.length,
      guard: items.filter((u) => u.role === 'guard').length,
      customer: items.filter((u) => u.role === 'customer').length,
      admin: items.filter((u) => u.role === 'admin').length,
    };
  }, [users.data]);

  const confirmVerification = async () => {
    const row = target?.row;
    const guardProfileId = row?.guardProfileId;
    if (!row || !guardProfileId) return;
    setBusy(true);
    try {
      await api.patch(`/admin/guards/${guardProfileId}/verification`, {
        status: target!.status,
        notes: notes.trim(),
      });
      toast.success(target!.status === 'verified' ? `${row.name} is now verified.` : 'Verification rejected.');
      setTarget(null);
      setNotes('');
      users.refetch();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Users" description="All customers, guards and admins on the platform." />

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          items={TAB_ITEMS.map((t) => ({ ...t, count: counts[t.id as keyof typeof counts] }))}
          value={role}
          onChange={setRole}
        />
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name or email…"
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {users.loading ? (
          <div className="p-6 text-sm text-slate-500">Loading users…</div>
        ) : users.error ? (
          <div className="p-6">
            <ErrorState message={users.error} onRetry={users.refetch} />
          </div>
        ) : (users.data?.items.length ?? 0) === 0 ? (
          <div className="p-6">
            <EmptyState icon={UsersIcon} title="No users found" description="Try a different search term or role filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">User</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Role</th>
                  <th scope="col" className="px-5 py-3 font-semibold">City</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Verification</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.data!.items.map((row) => (
                  <tr key={row.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{row.name}</p>
                          <p className="truncate text-xs text-slate-500">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={row.role === 'admin' ? 'brand' : row.role === 'guard' ? 'blue' : 'gray'}>
                        {row.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{row.city || '—'}</td>
                    <td className="px-5 py-3.5">
                      {row.verificationStatus ? (
                        <VerificationStatusBadge status={row.verificationStatus} />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {row.role === 'guard' && (row.verificationStatus === 'pending' || row.verificationStatus === 'unverified' || row.verificationStatus === 'rejected') ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setTarget({ row, status: 'verified' });
                              setNotes('');
                            }}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-outline"
                            onClick={() => {
                              setTarget({ row, status: 'rejected' });
                              setNotes('');
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={
          target
            ? target.status === 'verified'
              ? `Verify ${target.row.name}?`
              : `Reject verification for ${target.row.name}?`
            : 'Verification decision'
        }
        description={
          target?.status === 'verified'
            ? 'The guard will receive a verified badge and rank higher in search.'
            : 'The guard will be notified and can resubmit after updating their profile.'
        }
      >
        <Textarea
          label={target?.status === 'verified' ? 'Review notes (optional)' : 'Reason (recommended)'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          placeholder={target?.status === 'verified' ? 'e.g. ID and experience documents checked.' : 'e.g. Police verification document missing.'}
        />
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="outline" onClick={() => setTarget(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant={target?.status === 'verified' ? 'primary' : 'danger'} loading={busy} onClick={() => void confirmVerification()}>
            {target?.status === 'verified' ? 'Confirm verification' : 'Reject verification'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
