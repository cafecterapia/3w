import Link from 'next/link';

interface ProfileMenuProps {
  userLabel: string;
}

export function ProfileMenu({ userLabel }: ProfileMenuProps) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Faturas', href: '/billing' },
    { name: 'Configurações', href: '/settings' },
  ];

  return (
    <div className="ml-auto">
      <details className="group relative">
        <summary className="list-none cursor-pointer select-none rounded-md px-3 py-2 text-sm hover:bg-muted">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {userLabel.charAt(0)?.toUpperCase()}
            </span>
            <span className="hidden sm:inline text-sm">{userLabel}</span>
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
              >
                Meu perfil
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="block px-3 py-2 text-sm hover:bg-muted"
                role="menuitem"
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
