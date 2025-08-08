'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface ProfileMenuProps {
  userLabel: string;
}

export function ProfileMenu({ userLabel }: ProfileMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    const el = detailsRef.current;
    if (el?.open) el.removeAttribute('open');
  };

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const onToggle = () => {
      if (details.open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    const onDocumentClick = (e: MouseEvent | TouchEvent) => {
      if (!details.open) return;
      if (!details.contains(e.target as Node)) {
        details.removeAttribute('open');
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && details.open) {
        details.removeAttribute('open');
      }
    };

    details.addEventListener('toggle', onToggle);
    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('touchstart', onDocumentClick, { passive: true });
    document.addEventListener('keydown', onKeyDown);

    return () => {
      details.removeEventListener('toggle', onToggle);
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('touchstart', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Faturas', href: '/billing' },
    { name: 'Configurações', href: '/settings' },
  ];

  return (
    <div className="ml-auto">
      <details className="group relative" ref={detailsRef}>
        <summary className="list-none cursor-pointer select-none rounded-md px-3 py-2 text-sm hover:bg-muted">
          {/* Only the profile image (initial), no visible name */}
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium"
            aria-label={userLabel}
            title={userLabel}
          >
            {userLabel.charAt(0)?.toUpperCase()}
          </span>
        </summary>

        <div
          className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-secondary shadow-sm"
          role="menu"
          aria-label="Menu do usuário"
        >
          <ul className="py-1">
            {/* Navigation Items */}
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 text-sm hover:bg-muted"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            <li className="my-1 h-px bg-border" />

            {/* Profile and Support Links */}
            <li>
              <Link
                href="/profile"
                className="block px-3 py-2 text-sm hover:bg-muted"
                role="menuitem"
                onClick={closeMenu}
              >
                Meu perfil
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="block px-3 py-2 text-sm hover:bg-muted"
                role="menuitem"
                onClick={closeMenu}
              >
                Suporte
              </Link>
            </li>

            <li className="my-1 h-px bg-border" />

            {/* Sign Out */}
            <li>
              <Link
                href="/signout"
                className="block px-3 py-2 text-sm hover:bg-muted"
                role="menuitem"
                onClick={closeMenu}
              >
                Sair
              </Link>
            </li>
          </ul>
        </div>
      </details>
    </div>
  );
}
