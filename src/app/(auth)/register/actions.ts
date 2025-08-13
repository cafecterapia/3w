'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

// Define the validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As senhas não conferem',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterState = {
  message?: string;
  success?: boolean;
  // Field-level validation errors
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  // Echo back (safe) user inputs so the form doesn't reset on error
  // Note: we intentionally do not return password fields for security.
  fields?: {
    name?: string;
    email?: string;
  };
};

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  try {
    // Extract form data
    const validatedFields = registerSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    // If validation fails, return errors
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        // Return back safe fields to preserve user input
        fields: {
          name: String(formData.get('name') ?? ''),
          email: String(formData.get('email') ?? ''),
        },
      };
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          errors: { email: ['Este email já está em uso.'] },
          fields: { name, email },
        };
      }
    } catch (error) {
      console.error('Database error during user lookup:', error);
      return {
        message: 'Erro de conexão com o banco de dados. Tente novamente.',
        fields: {
          name: String(formData.get('name') ?? ''),
          email: String(formData.get('email') ?? ''),
        },
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.error('Database error during user creation:', error);
      return {
        message: 'Erro ao criar usuário. Tente novamente.',
        fields: { name, email },
      };
    }

    // Return success instead of redirecting
    return {
      success: true,
      message: 'Conta criada com sucesso! Redirecionando para o login...',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      message: 'Erro interno do servidor. Tente novamente.',
    };
  }
}
