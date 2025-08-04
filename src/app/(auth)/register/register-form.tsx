'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useActionState } from '@/lib/useActionState';
import type { RegisterState } from './actions';

interface RegisterFormProps {
  registerAction: (
    prevState: RegisterState,
    formData: FormData
  ) => Promise<RegisterState>;
}

export default function RegisterForm({ registerAction }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-md px-6 py-16 sm:py-24">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Crie sua conta
          </h1>
          <p className="mt-3 text-accent">
            Acesse o Portal do Aluno e gerencie tudo em um só lugar.
          </p>
        </header>

        {state?.message ? (
          <p
            role="status"
            className={`mb-6 text-center text-sm ${
              state.success ? 'text-[green]' : 'text-[crimson]'
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={isPending || !!state?.success}
                placeholder="Seu nome e sobrenome"
                className="w-full rounded-md border border-border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {state?.errors?.name ? (
                <p className="text-xs text-[crimson]">{state.errors.name[0]}</p>
              ) : null}
            </div>

            {/* Email */}
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
                disabled={isPending || !!state?.success}
                placeholder="nome@institucional.com"
                className="w-full rounded-md border border-border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {state?.errors?.email ? (
                <p className="text-xs text-[crimson]">
                  {state.errors.email[0]}
                </p>
              ) : null}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending || !!state?.success}
                placeholder="Mínimo de 8 caracteres"
                className="w-full rounded-md border border-border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {state?.errors?.password ? (
                <p className="text-xs text-[crimson]">
                  {state.errors.password[0]}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !!state?.success}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-secondary tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending
              ? 'Criando conta…'
              : state?.success
                ? 'Conta criada!'
                : 'Criar conta'}
          </button>

          <div className="h-px w-full bg-border" />

          <p className="text-center text-sm text-accent">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Faça login
            </Link>
          </p>
        </form>

        <footer className="mt-16">
          <p className="text-center text-xs text-accent">
            Ao continuar, você concorda com os termos e a política de
            privacidade.
          </p>
        </footer>
      </div>
    </main>
  );
}
