'use client';

import { useMemo, useState } from 'react';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER' | string;
  subscriptionStatus: string | null;
  efiSubscriptionId?: string | null;
  currentPeriodEnd?: Date | string | null;
};

type Props = {
  users: User[];
};

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" style={{ strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" style={{ strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-3.6-3.6" />
    </svg>
  );
}

function IconSort({ dir }: { dir: 'asc' | 'desc' | null }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" style={{ strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', opacity: dir ? 1 : 0.3 }}>
      {dir === 'asc' ? <path d="m7 15 5-5 5 5" /> : dir === 'desc' ? <path d="m7 9 5 5 5-5" /> : <path d="M8 9h8M8 15h8" />}
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" style={{ strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: 'var(--color-gray-100)',
        color: 'var(--color-gray-800)',
        border: '1px solid var(--color-gray-200)',
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: 'currentColor', opacity: 0.9 }} />
      {label}
    </span>
  );
}

function RolePill({ role }: { role: string }) {
  const strong = role === 'ADMIN';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: strong ? 'var(--color-gray-900)' : 'var(--color-gray-100)',
        color: strong ? 'var(--color-secondary)' : 'var(--color-gray-800)',
        border: strong ? '1px solid var(--color-gray-900)' : '1px solid var(--color-gray-200)',
        letterSpacing: 0.3,
      }}
      title={role}
    >
      {role}
    </span>
  );
}

type SortState = {
  key: keyof Pick<User, 'name' | 'email' | 'role' | 'subscriptionStatus' | 'currentPeriodEnd'> | null;
  dir: 'asc' | 'desc' | null;
};

export default function UsersClient({ users }: Props) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'canceled' | 'trialing' | 'past_due' | 'none'>('ALL');
  const [sort, setSort] = useState<SortState>({ key: null, dir: null });
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        (u.name?.toLowerCase().includes(q) ?? false) ||
        u.email.toLowerCase().includes(q) ||
        (u.subscriptionStatus ?? '').toLowerCase().includes(q);
      const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;
      const normalized = u.subscriptionStatus ?? 'none';
      const matchesStatus = statusFilter === 'ALL' ? true : normalized === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const sorted = useMemo(() => {
    if (!sort.key || !sort.dir) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const ak = a[sort.key!];
      const bk = b[sort.key!];
      const av = ak === null || ak === undefined ? '' : typeof ak === 'string' ? ak.toLowerCase() : String(ak);
      const bv = bk === null || bk === undefined ? '' : typeof bk === 'string' ? bk.toLowerCase() : String(bk);
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe]);

  function toggleSort(key: SortState['key']) {
    setPage(1);
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return { key: null, dir: null };
    });
  }

  return (
    <div style={{ color: 'var(--color-foreground)' }}>
      {/* Header / Controls */}
      <header
        className="mb-6"
        style={{
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          padding: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--color-foreground)',
              background: 'linear-gradient(180deg, var(--color-gray-50), transparent)',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            <IconUsers />
          </div>
          <div>
            <h1 style={{ fontSize: 20, lineHeight: '24px', fontWeight: 700 }}>Users</h1>
            <div style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>Total: {users.length} users</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <label
            className="group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              borderRadius: 10,
              padding: '8px 10px',
              minWidth: 240,
            }}
          >
            <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', color: 'var(--color-gray-600)' }}>
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-foreground)',
                fontSize: 14,
              }}
            />
          </label>

          {/* Role Filter */}
          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value as any);
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-foreground)',
              fontSize: 14,
            }}
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>

          {/* Status Filter */}
          <select
            aria-label="Filter by subscription status"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value as any);
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-foreground)',
              fontSize: 14,
            }}
          >
            <option value="ALL">All statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past due</option>
            <option value="canceled">Canceled</option>
            <option value="none">None</option>
          </select>
        </div>
      </header>

      {/* Table */}
      <section
        style={{
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: 14,
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'var(--color-card)',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-gray-600)',
                textTransform: 'uppercase',
                fontSize: 11,
                letterSpacing: 0.6,
              }}
            >
              <tr>
                <Th label="Name" onClick={() => toggleSort('name')} dir={sort.key === 'name' ? sort.dir : null} />
                <Th label="Email" onClick={() => toggleSort('email')} dir={sort.key === 'email' ? sort.dir : null} />
                <Th label="Role" onClick={() => toggleSort('role')} dir={sort.key === 'role' ? sort.dir : null} />
                <Th label="Subscription Status" onClick={() => toggleSort('subscriptionStatus')} dir={sort.key === 'subscriptionStatus' ? sort.dir : null} />
                <Th label="Current Period End" onClick={() => toggleSort('currentPeriodEnd')} dir={sort.key === 'currentPeriodEnd' ? sort.dir : null} />
                <th style={{ textAlign: 'left', padding: '10px 16px', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user, idx) => {
                const zebra = idx % 2 === 1;
                return (
                  <tr
                    key={user.id}
                    style={{
                      backgroundColor: zebra ? 'var(--color-gray-50)' : 'var(--color-card)',
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 140ms ease',
                    }}
                    className="hover:bg-[color:var(--color-gray-100)]"
                  >
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600 }}>{user.name || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div>{user.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <RolePill role={user.role} />
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <Pill label={user.subscriptionStatus || 'None'} />
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: 'var(--color-foreground)' }}>
                      {user.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <a
                          href={`/admin/users/${user.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: 'var(--color-foreground)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-card)',
                            fontSize: 13,
                            fontWeight: 600,
                            transition: 'background-color 160ms ease, border-color 160ms ease, transform 120ms ease',
                          }}
                          className="hover:bg-[color:var(--color-gray-50)]"
                        >
                          View
                          <IconChevronRight />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            // Hook up your deletion dialog/mutation here
                            // e.g., setConfirm({ id: user.id, email: user.email })
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 8,
                            color: 'var(--color-foreground)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-card)',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 160ms ease, border-color 160ms ease, transform 120ms ease',
                          }}
                          className="hover:bg-[color:var(--color-gray-50)]"
                        >
                          Delete
                          <IconChevronRight />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-gray-600)' }}>
              No users match your filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: 12,
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-card)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>
            Page {pageSafe} of {totalPages} • {sorted.length} results
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              style={navBtnStyle(pageSafe === 1)}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              style={navBtnStyle(pageSafe === totalPages)}
            >
              Next
            </button>
          </div>
        </footer>
      </section>

      <style jsx global>{`
        @supports (backdrop-filter: blur(6px)) {
          header,
          section {
            background-color: color-mix(in oklab, var(--color-card) 88%, transparent);
            backdrop-filter: saturate(160%) blur(6px);
          }
        }
        button:focus-visible,
        a:focus-visible,
        select:focus-visible,
        input:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--color-gray-300), 0 0 0 4px var(--color-gray-600);
          border-radius: 8px;
        }
        th button {
          color: inherit;
          font: inherit;
        }
      `}</style>
    </div>
  );
}

function Th({
  label,
  onClick,
  dir,
}: {
  label: string;
  onClick: () => void;
  dir: 'asc' | 'desc' | null;
}) {
  return (
    <th style={{ textAlign: 'left', padding: '10px 16px' }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          color: 'var(--color-gray-600)',
          cursor: 'pointer',
          padding: 0,
        }}
        aria-label={`Sort by ${label}${dir ? `, ${dir}ending` : ''}`}
      >
        {label}
        <IconSort dir={dir} />
      </button>
    </th>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-card)',
    color: disabled ? 'var(--color-gray-400)' : 'var(--color-foreground)',
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'background-color 160ms ease, border-color 160ms ease, transform 120ms ease',
  };
}