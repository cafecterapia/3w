import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AdminPage() {
  // Redirect to the dashboard by default
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  redirect('/admin/dashboard');
}
