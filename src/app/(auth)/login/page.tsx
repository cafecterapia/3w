'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Email e senha são obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos.');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Algo deu errado. Tente novamente.');
    }

    setIsLoading(false);
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
                placeholder="nome@institucional.com"
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
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-secondary tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="h-px w-full bg-border" />

          <p className="text-center text-sm text-accent">
            Não tem uma conta?{' '}
            <Link href="/register" className="font-medium text-foreground hover:underline underline-offset-4">
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