import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Server-side utility to check if the current user has admin access
 * @returns Promise<Session> if user is admin, otherwise redirects
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return session;
}

/**
 * Check if a user has admin role
 * @param session - The user session
 * @returns boolean
 */
export function isAdmin(session: any): boolean {
  return session?.user?.role === 'ADMIN';
}

/**
 * Client-side hook to check admin status
 * This should be used with useSession from next-auth/react
 */
export function useAdminCheck() {
  // This would be implemented in a client component
  // Example: const { data: session } = useSession();
  // return isAdmin(session);
}
