'use client';

import React from 'react';

interface Subscriber {
  id: string;
  name: string | null;
  email: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  efiSubscriptionId: string | null;
}

interface SubscribersClientProps {
  subscribers: Subscriber[];
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

function IconSearch() {
  return (
    <svg
      width="16"
      height="16"
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
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-3.6-3.6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg
      width="16"
      height="16"
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const map = {
    active: {
      bg: 'var(--color-gray-100)',
      fg: 'var(--color-gray-900)',
      label: 'Active',
    },
    canceled: {
      bg: 'var(--color-gray-100)',
      fg: 'var(--color-gray-700)',
      label: 'Canceled',
    },
    past_due: {
      bg: 'var(--color-gray-100)',
      fg: 'var(--color-gray-800)',
      label: 'Past Due',
    },
    trialing: {
      bg: 'var(--color-gray-100)',
      fg: 'var(--color-gray-800)',
      label: 'Trialing',
    },
    inactive: {
      bg: 'var(--color-gray-100)',
      fg: 'var(--color-gray-700)',
      label: 'Inactive',
    },
  } as const;

  const conf = (status && map[status as keyof typeof map]) || {
    bg: 'var(--color-gray-100)',
    fg: 'var(--color-gray-700)',
    label: status || 'Unknown',
  };

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
        backgroundColor: conf.bg,
        color: conf.fg,
        border: '1px solid var(--color-gray-200)',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: 'currentColor',
          opacity: status === 'canceled' ? 0.5 : 0.9,
        }}
      />
      {conf.label}
    </span>
  );
}

export function SubscribersClient({ subscribers }: SubscribersClientProps) {
  return (
    <div style={{ color: 'var(--color-foreground)' }}>
      {/* Page Header */}
      <header
        className="mb-6"
        style={{
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
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
            aria-hidden="true"
          >
            <IconUsers />
          </div>
          <div>
            <h1
              style={{
                fontSize: 20,
                lineHeight: '24px',
                fontWeight: 700,
                color: 'var(--color-foreground)',
              }}
            >
              Subscriber Management
            </h1>
            <p
              style={{
                marginTop: 2,
                fontSize: 13,
                color: 'var(--color-gray-600)',
              }}
            >
              View and manage all subscriber data
            </p>
          </div>
        </div>

        {/* Search (non-functional placeholder; wire up client-side as needed) */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            gap: 8,
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-card)',
            borderRadius: 10,
            padding: '8px 10px',
            minWidth: 220,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-grid',
              placeItems: 'center',
              color: 'var(--color-gray-600)',
            }}
          >
            <IconSearch />
          </span>
          <span
            style={{
              fontSize: 13,
              color: 'var(--color-gray-500)',
            }}
          >
            Search subscribers...
          </span>
        </div>
      </header>

      {/* Table Card */}
      <section
        style={{
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 12,
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                lineHeight: '20px',
                fontWeight: 600,
                color: 'var(--color-foreground)',
              }}
            >
              Subscribers ({subscribers.length})
            </h2>
            <p
              style={{
                marginTop: 2,
                fontSize: 13,
                color: 'var(--color-gray-600)',
              }}
            >
              List of all users with active or past subscriptions
            </p>
          </div>
        </div>

        {subscribers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: 'var(--color-gray-500)',
            }}
          >
            No subscribers found
          </div>
        ) : (
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
                }}
              >
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-gray-600)',
                    textTransform: 'uppercase',
                    fontSize: 11,
                    letterSpacing: 0.6,
                  }}
                >
                  <th style={{ textAlign: 'left', padding: '10px 16px' }}>
                    User
                  </th>
                  <th style={{ textAlign: 'left', padding: '10px 16px' }}>
                    Subscription Status
                  </th>
                  <th style={{ textAlign: 'left', padding: '10px 16px' }}>
                    Period End
                  </th>
                  <th style={{ textAlign: 'left', padding: '10px 16px' }}>
                    EFI ID
                  </th>
                  <th style={{ textAlign: 'left', padding: '10px 16px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber, idx) => {
                  const zebra = idx % 2 === 1;
                  return (
                    <tr
                      key={subscriber.id}
                      style={{
                        backgroundColor: zebra
                          ? 'var(--color-gray-50)'
                          : 'var(--color-card)',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color 140ms ease',
                      }}
                      className="hover:bg-[color:var(--color-gray-100)]"
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: 'var(--color-foreground)',
                              lineHeight: '18px',
                            }}
                          >
                            {subscriber.name || 'No name'}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--color-gray-600)',
                            }}
                          >
                            {subscriber.email || 'No email'}
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                        }}
                      >
                        <StatusPill status={subscriber.subscriptionStatus} />
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                          color: 'var(--color-foreground)',
                        }}
                      >
                        {subscriber.currentPeriodEnd
                          ? new Date(
                              subscriber.currentPeriodEnd
                            ).toLocaleDateString()
                          : 'N/A'}
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                          color: 'var(--color-gray-600)',
                        }}
                      >
                        {subscriber.efiSubscriptionId || 'N/A'}
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <a
                            href={`/admin/subscribers/${subscriber.id}`}
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
                              transition:
                                'background-color 160ms ease, border-color 160ms ease, transform 120ms ease',
                            }}
                            className="hover:bg-[color:var(--color-gray-50)]"
                          >
                            View
                            <IconChevronRight />
                          </a>
                          <a
                            href={`/admin/subscribers/${subscriber.id}/manage`}
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
                              transition:
                                'background-color 160ms ease, border-color 160ms ease, transform 120ms ease',
                            }}
                            className="hover:bg-[color:var(--color-gray-50)]"
                          >
                            Manage
                            <IconChevronRight />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style jsx global>{`
        @supports (backdrop-filter: blur(6px)) {
          header,
          section {
            background-color: color-mix(
              in oklab,
              var(--color-card) 88%,
              transparent
            );
            backdrop-filter: saturate(160%) blur(6px);
          }
        }

        a:focus-visible,
        button:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px var(--color-gray-300),
            0 0 0 4px var(--color-gray-600);
          border-radius: 8px;
        }

        @media (min-width: 768px) {
          .hidden.md\\:flex {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
