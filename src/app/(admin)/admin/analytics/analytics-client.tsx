'use client';

type AnalyticsData = {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  usersWithSubscriptions: number;
};

type Props = {
  data: AnalyticsData;
};

/* Monochrome, pixel-hinted icons (currentColor) */
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

function IconAdmin() {
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
      <path d="m9 12 2 2 4-4" />
      <path d="M20.618 7.984A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconRegular() {
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
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}

function IconSubscription() {
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
      <path d="m9 12 2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function StatTile({
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
    <div
      className="group"
      role="region"
      aria-label={typeof value === 'number' ? `${title}: ${value}` : title}
      style={{
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-card-foreground)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition:
          'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
      }}
    >
      <div
        aria-hidden="true"
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
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: 'var(--color-gray-600)',
            fontWeight: 500,
          }}
          className="truncate"
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
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
              color: 'var(--color-gray-500)',
            }}
          >
            {hint}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Ring({ percent, label }: { percent: number; label: string }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
        <g transform="translate(55,55) rotate(-90)">
          <circle
            cx="0"
            cy="0"
            r={r}
            fill="none"
            stroke="var(--color-gray-200)"
            strokeWidth="10"
          />
          <circle
            cx="0"
            cy="0"
            r={r}
            fill="none"
            stroke="var(--color-gray-800)"
            strokeWidth="10"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-foreground)',
          }}
        >
          {p}%
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  percent,
}: {
  label: string;
  value: number;
  percent: number;
}) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: 'var(--color-gray-700)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
          {value} • {p.toFixed(1)}%
        </span>
      </div>
      <div
        aria-hidden="true"
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: 'var(--color-gray-100)',
          overflow: 'hidden',
          border: '1px solid var(--color-gray-200)',
        }}
      >
        <div
          style={{
            width: `${p}%`,
            height: '100%',
            background:
              'linear-gradient(90deg, var(--color-gray-800), var(--color-gray-700))',
          }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsClient({ data }: Props) {
  const {
    totalUsers,
    adminUsers,
    regularUsers,
    activeSubscriptions,
    canceledSubscriptions,
    usersWithSubscriptions,
  } = data;

  const conversionRate =
    totalUsers > 0 ? (usersWithSubscriptions / totalUsers) * 100 : 0;
  const adminPercentage = totalUsers > 0 ? (adminUsers / totalUsers) * 100 : 0;
  const regularPercentage =
    totalUsers > 0 ? (regularUsers / totalUsers) * 100 : 0;

  return (
    <div style={{ color: 'var(--color-foreground)' }}>
      {/* Header */}
      <header
        className="mb-6"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: -0.1,
            color: 'var(--color-foreground)',
          }}
        >
          Analytics
        </h1>
        <div
          style={{ fontSize: 12, color: 'var(--color-gray-600)' }}
          aria-live="polite"
        >
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* Key Metrics */}
      <section
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        }}
      >
        <div className="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          <div className="mb-4 md:mb-0">
            <StatTile
              title="Total Users"
              value={totalUsers}
              icon={<IconUsers />}
            />
          </div>
          <div className="mb-4 md:mb-0">
            <StatTile
              title="Admin Users"
              value={adminUsers}
              icon={<IconAdmin />}
            />
          </div>
          <div className="mb-4 md:mb-0">
            <StatTile
              title="Regular Users"
              value={regularUsers}
              icon={<IconRegular />}
            />
          </div>
          <div>
            <StatTile
              title="Active Subscriptions"
              value={activeSubscriptions}
              icon={<IconSubscription />}
            />
          </div>
        </div>
      </section>

      {/* Insights */}
      <section
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' }}
      >
        {/* Conversion ring + quick stats */}
        <div
          style={{
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-card)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            padding: 16,
            display: 'grid',
            gap: 16,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-foreground)',
            }}
          >
            Subscription Overview
          </h2>

          <div
            className="grid"
            style={{ gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}
          >
            <div className="sm:grid sm:grid-cols-[auto,1fr] sm:gap-16">
              <Ring
                percent={conversionRate}
                label="Conversion rate (users with subscriptions)"
              />

              <div className="grid gap-10 mt-6 sm:mt-0">
                <div className="grid gap-4">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: 'var(--color-gray-600)' }}
                    >
                      Active
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-foreground)',
                      }}
                    >
                      {activeSubscriptions}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: 'var(--color-gray-600)' }}
                    >
                      Canceled
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-foreground)',
                      }}
                    >
                      {canceledSubscriptions}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: 'var(--color-gray-600)' }}
                    >
                      Total with subscriptions
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-foreground)',
                      }}
                    >
                      {usersWithSubscriptions}
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    color: 'var(--color-gray-700)',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: 'var(--color-gray-800)',
                        display: 'inline-block',
                      }}
                    />
                    Converted
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: 'var(--color-gray-200)',
                        display: 'inline-block',
                      }}
                    />
                    Remainder
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div
          style={{
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-card)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            padding: 16,
            display: 'grid',
            gap: 14,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-foreground)',
            }}
          >
            User Distribution
          </h2>
          <BarRow
            label="Admin Users"
            value={adminUsers}
            percent={adminPercentage}
          />
          <BarRow
            label="Regular Users"
            value={regularUsers}
            percent={regularPercentage}
          />
        </div>
      </section>

      <style jsx global>{`
        @supports (backdrop-filter: blur(6px)) {
          section > div,
          .group,
          .ring {
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
        a:focus-visible,
        button:focus-visible,
        [role='region']:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px var(--color-gray-300),
            0 0 0 4px var(--color-gray-600);
          border-radius: 8px;
        }
        @media (min-width: 768px) {
          .md\\:grid {
            display: grid;
          }
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .lg\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
