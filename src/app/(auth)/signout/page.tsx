'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/login',
      });
      // Redirect after successful signout
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Sair da conta
          </h1>
          <p className="mt-3 text-accent">
            Tem certeza de que deseja encerrar sua sessão?
          </p>
        </header>

        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-secondary tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningOut ? 'Saindo…' : 'Sim, sair'}
          </button>

          <button
            onClick={handleCancel}
            disabled={isSigningOut}
            className="inline-flex w-full items-center justify-center rounded-md border border-border bg-secondary px-5 py-3 text-sm font-medium tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-border/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-accent">
            Ou volte para{' '}
            <Link
              href="/dashboard"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Dashboard
            </Link>
          </p>
        </div>

        <footer className="mt-16">
          <p className="text-center text-xs text-accent">
            Sua sessão será encerrada com segurança.
          </p>
        </footer>
      </div>
    </main>
  );
}
