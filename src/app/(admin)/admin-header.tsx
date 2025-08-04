"use client";

import { useRouter } from 'next/navigation';

type AdminHeaderProps = {
  userEmail: string;
};

function IconShield() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{ strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{ strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}

function IconLogOut() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{ strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function AdminHeader({ userEmail }: AdminHeaderProps) {
  const NAV_HEIGHT = 60;
  const router = useRouter();

  const handleSignOut = () => {
    router.push('/signout');
  };

  return (
    <>
      {/* Spacer to prevent content shift with sticky header */}
      <div style={{ height: NAV_HEIGHT }} aria-hidden="true" />
      <header
        role="banner"
        className="sticky top-0 z-50"
        style={{
          height: NAV_HEIGHT,
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-foreground)',
          WebkitBackdropFilter: 'saturate(180%) blur(6px)',
          backdropFilter: 'saturate(180%) blur(6px)',
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: '72rem', // ~max-w-7xl
            paddingLeft: '1rem',
            paddingRight: '1rem',
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
              gap: 12,
            }}
          >
            {/* Brand / Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--color-foreground)',
                  background: 'linear-gradient(180deg, var(--color-gray-50), transparent)',
                  border: '1px solid var(--color-gray-200)',
                }}
              >
                <IconShield />
              </div>
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 0.1,
                  color: 'var(--color-foreground)',
                  whiteSpace: 'nowrap',
                }}
              >
                Admin Panel
              </h1>
            </div>

            {/* Right cluster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              {/* Logged in */}
              <div
                title={userEmail}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)',
                  maxWidth: '60vw',
                }}
              >
                <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', color: 'var(--color-gray-700)' }}>
                  <IconUser />
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--color-gray-700)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userEmail}
                </span>
              </div>

              {/* Role badge */}
              <span
                aria-label="Role: Admin"
                title="Admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  backgroundColor: 'var(--color-gray-900)',
                  color: 'var(--color-secondary)',
                  border: '1px solid var(--color-gray-900)',
                  whiteSpace: 'nowrap',
                }}
              >
                Admin
              </span>

              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                title="Sign out"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-gray-700)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                  e.currentTarget.style.color = 'var(--color-foreground)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-card)';
                  e.currentTarget.style.color = 'var(--color-gray-700)';
                }}
              >
                <IconLogOut />
              </button>
            </div>
          </div>
        </div>
      </header>

      <style jsx global>{`
        @supports (backdrop-filter: blur(6px)) {
          header[role='banner'] {
            background-color: color-mix(in oklab, var(--color-background) 90%, transparent);
          }
        }
      `}</style>
    </>
  );
}