import Link from 'next/link';

export function Sidebar() {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Faturas', href: '/billing' },
    { name: 'Configurações', href: '/settings' },
  ];

  return (
    <aside
      className="col-span-12 sm:col-span-3 lg:col-span-2 border-r border-border sticky top-0 h-dvh hidden sm:flex flex-col bg-background"
      aria-label="Navegação principal"
    >
      <div className="flex h-16 items-center justify-between pr-3">
        <Link href="/dashboard" className="block">
          <span className="text-lg font-semibold tracking-tight">Portal</span>
        </Link>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <Link
          href="/support"
          className="block rounded-md px-3 py-2 text-sm text-accent hover:bg-muted"
        >
          Suporte
        </Link>
      </div>
    </aside>
  );
}

