import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ReactNode } from 'react';
import AdminNavigation from './admin-navigation';
import AdminHeader from './admin-header';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect('/login');
  }

  // Check if user has admin role
  if (session.user.role !== 'ADMIN') {
    // Redirect non-admin users to dashboard or home page
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader userEmail={session.user.email || ''} />

      {/* Admin Navigation */}
      <AdminNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
    </div>
  );
}
