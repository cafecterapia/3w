'use server';

import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';

export interface LoginState {
  message?: string;
}

export async function loginUser(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return {
        message: 'Email e senha são obrigatórios.',
      };
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        message: 'Email ou senha inválidos.',
      };
    }

    redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Algo deu errado. Tente novamente.',
    };
  }
}
