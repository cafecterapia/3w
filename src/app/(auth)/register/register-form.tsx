'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useActionState } from '@/lib/useActionState';
import type { RegisterState } from './actions';

interface RegisterFormProps {
  registerAction: (
    prevState: RegisterState,
    formData: FormData
  ) => Promise<RegisterState>;
  planDetails?: {
    classCount: number;
    schedulingOption: 'recurring' | 'on-demand';
    totalPrice: number;
  } | null;
}

export default function RegisterForm({
  registerAction,
  planDetails,
}: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        if (planDetails) {
          // If user registered with a plan selection, redirect to payment
          const paymentUrl = `/api/payments/create-class-subscription`;
          // In a real implementation, you would handle the payment flow here
          // For now, redirect to login with plan info
          router.push(
            `/login?plan=${planDetails.classCount}&scheduling=${planDetails.schedulingOption}&price=${planDetails.totalPrice}`
          );
        } else {
          router.push('/login');
        }
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router, planDetails]);

  // Focus the first field with error for quick correction
  useEffect(() => {
    if (!state?.success && state?.errors) {
      const order: Array<keyof NonNullable<typeof state.errors>> = [
        'name',
        'email',
        'password',
        'confirmPassword',
      ];
      const firstKey = order.find(
        (k) => state.errors && state.errors[k]?.length
      );
      if (firstKey) {
        const el = document.getElementById(String(firstKey));
        if (el && 'focus' in el) (el as HTMLInputElement).focus();
      }
    }
  }, [state]);

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

        {/* Success message only; for errors we show inline messages per field */}
        {state?.success && state?.message ? (
          <p role="status" className="mb-6 text-center text-sm text-primary">
            {state.message}
          </p>
        ) : null}

        {!state?.success && state?.message && !state?.errors ? (
          <p role="alert" className="mb-6 text-center text-sm text-accent">
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
                defaultValue={state?.fields?.name ?? ''}
                aria-invalid={Boolean(state?.errors?.name?.length) || undefined}
                aria-describedby={
                  state?.errors?.name?.length ? 'name-error' : undefined
                }
                className={`w-full rounded-md border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                  state?.errors?.name?.length
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-foreground'
                }`}
              />
              {state?.errors?.name ? (
                <p id="name-error" className="text-xs text-destructive">
                  {state.errors.name[0]}
                </p>
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
                placeholder="nome@email.com"
                defaultValue={state?.fields?.email ?? ''}
                aria-invalid={
                  Boolean(state?.errors?.email?.length) || undefined
                }
                aria-describedby={
                  state?.errors?.email?.length ? 'email-error' : undefined
                }
                className={`w-full rounded-md border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                  state?.errors?.email?.length
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-foreground'
                }`}
              />
              {state?.errors?.email ? (
                <p id="email-error" className="text-xs text-destructive">
                  {state.errors.email[0]}
                </p>
              ) : null}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={isPending || !!state?.success}
                  placeholder="Mínimo de 8 caracteres"
                  aria-invalid={
                    Boolean(state?.errors?.password?.length) || undefined
                  }
                  aria-describedby={
                    state?.errors?.password?.length
                      ? 'password-error'
                      : undefined
                  }
                  className={`w-full rounded-md border bg-secondary/50 px-4 py-3 pr-10 text-base outline-none placeholder:text-accent focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                    state?.errors?.password?.length
                      ? 'border-destructive focus:border-destructive'
                      : 'border-border focus:border-foreground'
                  }`}
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
              {state?.errors?.password ? (
                <p id="password-error" className="text-xs text-destructive">
                  {state.errors.password[0]}
                </p>
              ) : null}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending || !!state?.success}
                placeholder="Repita a senha"
                aria-invalid={
                  Boolean(state?.errors?.confirmPassword?.length) || undefined
                }
                aria-describedby={
                  state?.errors?.confirmPassword?.length
                    ? 'confirmPassword-error'
                    : undefined
                }
                className={`w-full rounded-md border bg-secondary/50 px-4 py-3 text-base outline-none placeholder:text-accent focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                  state?.errors?.confirmPassword?.length
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-foreground'
                }`}
              />
              {state?.errors?.confirmPassword ? (
                <p
                  id="confirmPassword-error"
                  className="text-xs text-destructive"
                >
                  {state.errors.confirmPassword[0]}
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
