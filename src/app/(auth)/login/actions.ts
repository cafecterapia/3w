'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

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

    // Verify user credentials
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return {
        message: 'Email ou senha inválidos.',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        message: 'Email ou senha inválidos.',
      };
    }

    // Store user info for client-side redirect
    const cookieStore = await cookies();
    cookieStore.set(
      'pending-redirect',
      (user as any)?.role === 'ADMIN' ? 'admin' : 'user',
      {
        httpOnly: false,
        maxAge: 30, // 30 seconds
        path: '/',
      }
    );

    // Return success - the client will handle the actual NextAuth signIn
    return { message: 'login-success' };
  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Algo deu errado. Tente novamente.',
    };
  }
}
