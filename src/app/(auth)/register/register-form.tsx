
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from '@/lib/useActionState';
import type { RegisterState } from './actions';

interface RegisterFormProps {
  registerAction: (prevState: RegisterState, formData: FormData) => Promise<RegisterState>;
}

export default function RegisterForm({ registerAction }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <>
      {state?.message && (
        <p
          className={`mt-2 text-center text-sm ${
            state.success ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {state.message}
        </p>
      )}
      <form action={formAction} className="mt-8 space-y-6">
        {/* ... the rest of your form remains exactly the same ... */}
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="name" className="sr-only">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isPending || state.success}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Nome completo"
            />
            {state?.errors?.name && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.name[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Endereço de e-mail
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending || state.success}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Email"
            />
            {state?.errors?.email && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.email[0]}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={isPending || state.success}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Senha"
            />
            {state?.errors?.password && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.password[0]}
              </p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending || state.success}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isPending
              ? 'Criando conta...'
              : state.success
                ? 'Conta criada!'
                : 'Criar conta'}
          </button>
        </div>

        <div className="text-center">
          <a href="/login" className="text-foreground hover:text-indigo-500">
            Já tem uma conta? Faça login
          </a>
        </div>
      </form>
    </>
  );
}
