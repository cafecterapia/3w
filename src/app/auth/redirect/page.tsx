import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function PostAuthRedirect() {
  const session = await auth();
  if (!session || !session.user) {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || '';
    const proto = h.get('x-forwarded-proto') || 'https';
    const origin = host ? `${proto}://${host}` : '';
    redirect(origin ? `${origin}/login` : '/login');
  }

  const role = (session.user as any).role;
  if (role === 'ADMIN') {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || '';
    const proto = h.get('x-forwarded-proto') || 'https';
    const origin = host ? `${proto}://${host}` : '';
    redirect(origin ? `${origin}/admin` : '/admin');
  }

  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  const proto = h.get('x-forwarded-proto') || 'https';
  const origin = host ? `${proto}://${host}` : '';
  redirect(origin ? `${origin}/dashboard` : '/dashboard');
}
