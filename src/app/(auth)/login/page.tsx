'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { loginUser, LoginState } from './actions';
import { useActionState } from '@/lib/useActionState';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState>(
    loginUser,
    {}
  );
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleNextAuthSignIn = useCallback(async () => {
    try {
      // Get the form data
      const form = document.querySelector('form') as HTMLFormElement | null;
      const formData = new FormData(form ?? undefined);
      const email = (formData.get('email') as string) || '';
      const password = (formData.get('password') as string) || '';

      // Now use NextAuth to actually sign in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        // Check the redirect cookie to determine where to go
        const redirectType = document.cookie
          .split('; ')
          .find((row) => row.startsWith('pending-redirect='))
          ?.split('=')[1];

        // Clear the cookie
        document.cookie = 'pending-redirect=; Max-Age=0; path=/';

        if (redirectType === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('NextAuth sign in error:', error);
    } finally {
      // no-op: pending state is controlled by useActionState
    }
  }, [router]);

  // Handle successful credential verification
  useEffect(() => {
    if (state.message === 'login-success') {
      handleNextAuthSignIn();
    }
  }, [state.message, handleNextAuthSignIn]);

  function handleSubmit(formData: FormData) {
    // Trigger the server action; hook exposes isPending while it runs
    formAction(formData);
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">
            Entre na sua conta
          </h1>
          <p className="mt-3 text-center text-accent">
            Acesse faturas, assinaturas e notificações com segurança.
          </p>
          {state.message ? (
            <p role="alert" className="mt-4 text-center text-sm text-[crimson]">
              {state.message}
            </p>
          ) : null}
        </header>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nome@email.com"
                className="w-full rounded-md border border-border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-accent hover:underline underline-offset-4"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border bg-secondary/50 px-4 py-3 pr-10 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center p-1 text-accent hover:text-foreground focus:outline-none"
                >
                  {showPassword ? (
                    // Eye off icon
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0112 19c-6.5 0-10-7-10-7a21.8 21.8 0 015.06-5.94" />
                      <path d="M9.88 4.12A10.94 10.94 0 0112 5c6.5 0 10 7 10 7a21.8 21.8 0 01-4.06 5.15" />
                      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-secondary tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="h-px w-full bg-border" />

          <p className="text-center text-sm text-accent">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Criar minha conta
            </Link>
          </p>
        </form>

        <footer className="mt-16">
          <p className="text-center text-xs text-accent">
            Este acesso é exclusivo para alunos cadastrados.
          </p>
        </footer>
      </div>
    </main>
  );
}
