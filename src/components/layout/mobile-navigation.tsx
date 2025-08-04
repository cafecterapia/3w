import Link from 'next/link';

export function MobileNavigation() {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Faturas', href: '/billing' },
    { name: 'Config.', href: '/settings' },
  ];

  return (
    <div className="flex items-center gap-2 sm:hidden">
      <Link
        href="/dashboard"
        className="px-3 py-2 text-sm font-semibold tracking-tight"
      >
        Portal
      </Link>
      <div className="flex items-center gap-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
