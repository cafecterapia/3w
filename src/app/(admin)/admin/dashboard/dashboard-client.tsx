'use client';

import React from 'react';

interface AdminStats {
  totalUsers: number;
  totalSubscribers: number;
  activeSubscriptions: number;
}

interface AdminDashboardClientProps {
  stats: AdminStats;
  nameOrEmail: string;
}

function Card({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <section
      className="group relative overflow-hidden"
      style={{
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-card-foreground)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        transition:
          'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
      }}
    >
      <div
        style={{
          padding: '16px 16px 14px 16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--color-foreground)',
              background:
                'linear-gradient(180deg, var(--color-gray-50), transparent)',
              border: '1px solid var(--color-gray-200)',
            }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div
              className="truncate"
              style={{
                fontSize: 13,
                lineHeight: '18px',
                color: 'var(--color-gray-600)',
                fontWeight: 500,
                letterSpacing: 0.1,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 24,
                lineHeight: '28px',
                fontWeight: 600,
                color: 'var(--color-foreground)',
              }}
            >
              {value}
            </div>
            {hint ? (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: 'var(--color-gray-500)',
                }}
              >
                {hint}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* subtle corner accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'absolute',
          right: -24,
          top: -24,
          width: 96,
          height: 96,
          borderRadius: 24,
          background:
            'radial-gradient(closest-side, var(--color-gray-100), transparent)',
          filter: 'blur(0.3px)',
          opacity: 0.7,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.02), transparent 30%)',
          opacity: 1,
        }}
      />
    </section>
  );
}

function IconUsers() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconSubscribers() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M7 9h10" />
      <path d="M7 13h6" />
    </svg>
  );
}

function IconActive() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-foreground)',
        textDecoration: 'none',
        transition:
          'transform 160ms ease, background-color 160ms ease, border-color 160ms ease',
      }}
    >
      <span
        className="shrink-0"
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--color-gray-50)',
          border: '1px solid var(--color-gray-200)',
          color: 'var(--color-gray-800)',
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </a>
  );
}

export function AdminDashboardClient({
  stats,
  nameOrEmail,
}: AdminDashboardClientProps) {
  return (
    <div
      style={{
        color: 'var(--color-foreground)',
      }}
    >
      {/* Header */}
      <header
        className="mb-6"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              lineHeight: '28px',
              fontWeight: 700,
              letterSpacing: -0.1,
              color: 'var(--color-foreground)',
            }}
          >
            Admin Dashboard
          </h1>
          <p
            style={{
              marginTop: 4,
              fontSize: 14,
              color: 'var(--color-gray-600)',
            }}
          >
            Welcome back, {nameOrEmail}
          </p>
        </div>

        {/* Optional date or quick summary */}
        <div
          className="hidden md:flex items-center gap-2"
          style={{ color: 'var(--color-gray-500)', fontSize: 13 }}
          aria-hidden="true"
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: 'var(--color-gray-400)',
              display: 'inline-block',
            }}
          />
          Up to date
        </div>
      </header>

      {/* Stats Grid */}
      <section
        className="grid gap-4 mb-8"
        style={{
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        }}
      >
        <div className="md:grid md:grid-cols-3 md:gap-4">
          <div className="mb-4 md:mb-0">
            <Card
              title="Total Users"
              value={stats.totalUsers}
              hint="All registered accounts"
              icon={<IconUsers />}
            />
          </div>
          <div className="mb-4 md:mb-0">
            <Card
              title="Total Subscribers"
              value={stats.totalSubscribers}
              hint="Users with any subscription"
              icon={<IconSubscribers />}
            />
          </div>
          <div>
            <Card
              title="Active Subscriptions"
              value={stats.activeSubscriptions}
              hint="Currently active plans"
              icon={<IconActive />}
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section
        aria-labelledby="quick-actions"
        style={{
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <h2
              id="quick-actions"
              style={{
                fontSize: 16,
                lineHeight: '20px',
                fontWeight: 600,
                color: 'var(--color-foreground)',
              }}
            >
              Quick Actions
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-gray-600)',
                marginTop: 2,
              }}
            >
              Jump into frequent tasks
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '0 16px 16px 16px',
          }}
        >
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
            }}
          >
            <QuickLink
              href="/admin/subscribers"
              label="View Subscribers"
              icon={<IconSubscribers />}
            />
            <QuickLink
              href="/admin/users"
              label="Manage Users"
              icon={<IconUsers />}
            />
            <QuickLink
              href="/admin/analytics"
              label="View Analytics"
              icon={<IconActive />}
            />
          </div>
        </div>
      </section>

      <style jsx global>{`
        @supports (backdrop-filter: blur(6px)) {
          section[role='region'],
          section[aria-labelledby='quick-actions'],
          section.group {
            background-color: color-mix(
              in oklab,
              var(--color-card) 88%,
              transparent
            );
            backdrop-filter: saturate(160%) blur(6px);
          }
        }

        .group:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
          border-color: var(--color-gray-200);
        }

        a.group:hover {
          background-color: var(--color-gray-50);
          border-color: var(--color-gray-200);
        }

        a.group:focus-visible,
        section.group:focus-within {
          outline: none;
          box-shadow:
            0 0 0 2px var(--color-gray-300),
            0 0 0 4px var(--color-gray-600);
        }

        @media (min-width: 768px) {
          .grid.md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .md\\:grid {
            display: grid;
          }
          .md\\:gap-4 {
            gap: 1rem;
          }
          .md\\:mb-0 {
            margin-bottom: 0;
          }
          .hidden.md\\:flex {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
