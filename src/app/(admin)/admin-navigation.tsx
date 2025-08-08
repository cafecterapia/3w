'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
};

const NAV_HEIGHT = 56; // 14 * 4px (tailwind scale) -> consistent fixed height

export default function AdminNavigation() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const [focusIndex, setFocusIndex] = useState<number>(0);

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/subscribers', label: 'Subscribers' },
      { href: '/admin/payments', label: 'Payments' },
      { href: '/admin/test-efi', label: 'Test EFI' },
      { href: '/admin/analytics', label: 'Analytics' },
    ],
    []
  );

  // Keep focusIndex synced with active route for ergonomic keyboard navigation
  useEffect(() => {
    const idx = navItems.findIndex((n) => n.href === pathname);
    if (idx !== -1) setFocusIndex(idx);
  }, [pathname, navItems]);

  // Keyboard navigation: left/right arrows to move between tabs
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key !== 'ArrowRight' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'Home' &&
      e.key !== 'End'
    )
      return;
    e.preventDefault();

    if (e.key === 'Home') {
      setFocusIndex(0);
      (
        navRef.current?.querySelectorAll('a')[0] as
          | HTMLAnchorElement
          | undefined
      )?.focus();
      return;
    }
    if (e.key === 'End') {
      setFocusIndex(navItems.length - 1);
      (
        navRef.current?.querySelectorAll('a')[navItems.length - 1] as
          | HTMLAnchorElement
          | undefined
      )?.focus();
      return;
    }

    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (focusIndex + dir + navItems.length) % navItems.length;
    setFocusIndex(next);
    (
      navRef.current?.querySelectorAll('a')[next] as
        | HTMLAnchorElement
        | undefined
    )?.focus();
  };

  return (
    <>
      {/* Spacer to guarantee the rest of the page never shifts when sticky engages */}
      <div style={{ height: NAV_HEIGHT }} aria-hidden="true" />
      <nav
        ref={navRef}
        aria-label="Admin"
        className="sticky top-0 z-40 border-b"
        style={{
          height: NAV_HEIGHT,
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-foreground)',
          WebkitBackdropFilter: 'saturate(180%) blur(6px)',
          backdropFilter: 'saturate(180%) blur(6px)',
        }}
      >
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: '72rem', // ~max-w-7xl
          }}
        >
          <div
            className="flex items-center"
            style={{
              height: NAV_HEIGHT,
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }}
          >
            <div
              role="tablist"
              aria-label="Admin sections"
              className="flex gap-2 overflow-x-auto no-scrollbar w-full"
              onKeyDown={onKeyDown}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="tab"
                    aria-selected={isActive}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={index === focusIndex ? 0 : -1}
                    className="relative group"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: NAV_HEIGHT,
                      padding: '0 12px',
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      borderRadius: 8,
                      outline: 'none',
                      color: isActive
                        ? 'var(--color-foreground)'
                        : 'var(--color-gray-600)',
                    }}
                  >
                    <span
                      className="focus:outline-none"
                      style={{
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Active underline indicator */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 8,
                        right: 8,
                        bottom: 6,
                        height: 2,
                        borderRadius: 2,
                        backgroundColor: isActive
                          ? 'var(--color-gray-900)'
                          : 'transparent',
                        transition:
                          'background-color 180ms ease, transform 180ms ease',
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'center',
                      }}
                      className="group-hover:scale-x-100"
                    />

                    {/* Hover/Focus background for better hit area and accessibility */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        background: isActive
                          ? 'var(--color-gray-50)'
                          : 'transparent',
                        transition: 'background-color 160ms ease',
                      }}
                      className="group-hover:bg-[color:var(--color-gray-50)]"
                    />

                    {/* Focus ring (uses brand grayscale) */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none"
                      style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: 10,
                        boxShadow: '0 0 0 2px transparent',
                      }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        a[role='tab']:focus-visible {
          box-shadow:
            0 0 0 2px var(--color-gray-300),
            0 0 0 4px var(--color-gray-600);
        }
        @media (hover: hover) and (pointer: fine) {
          a[role='tab']:hover {
            color: var(--color-foreground);
          }
        }
        @supports (backdrop-filter: blur(6px)) {
          nav[aria-label='Admin'] {
            background-color: color-mix(
              in oklab,
              var(--color-background) 85%,
              transparent
            );
          }
        }
      `}</style>
    </>
  );
}
