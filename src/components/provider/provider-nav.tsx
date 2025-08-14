'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users } from 'lucide-react';

export default function ProviderNav({
  providerSlug,
}: {
  providerSlug: string;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: `/providers/${providerSlug}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: 'Services',
      href: `/providers/${providerSlug}/services`,
      icon: Package,
    },
    {
      label: 'Subscribers',
      href: `/providers/${providerSlug}/subscribers`,
      icon: Users,
    },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="px-6">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-foreground hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
