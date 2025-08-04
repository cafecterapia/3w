// app/(app)/layout.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProfileMenu } from '@/components/layout';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const userLabel = session.user?.name || session.user?.email || 'Conta';

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Profile Menu Navigation */}
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
          <div className="flex h-16 items-center justify-between">
            {/* Left cluster: Brand */}
            <Link href="/dashboard" className="block">
              <span className="text-lg font-semibold tracking-tight">
                Portal
              </span>
            </Link>

            {/* Right cluster: Profile menu with navigation */}
            <ProfileMenu userLabel={userLabel} />
          </div>
        </header>

        {/* Main content */}
        <main className="py-8">
          <div className="mx-auto max-w-3xl lg:max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
