'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession, getSession } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    if (!email || !password) {
      setError('Email e senha são obrigatórios.');
      setIsSubmitting(false);
      return;
    }
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError('Email ou senha inválidos.');
      setIsSubmitting(false);
      return;
    }
    // Force fetch updated session to read role reliably
    const fresh = await getSession();
    const role = (fresh?.user as any)?.role;
    if (role === 'ADMIN') router.push('/admin');
    else router.push('/dashboard');
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
          {error ? (
            <p role="alert" className="mt-4 text-center text-sm text-[crimson]">
              {error}
            </p>
          ) : null}
        </header>
        <form onSubmit={onSubmit} className="space-y-6">
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
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-secondary tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
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
