'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

// Define the validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type RegisterState = {
  message?: string;
  success?: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
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
    });

    // If validation fails, return errors
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Dados inválidos. Por favor, verifique os campos.',
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
          message: 'Este email já está em uso.',
        };
      }
    } catch (error) {
      console.error('Database error during user lookup:', error);
      return {
        message: 'Erro de conexão com o banco de dados. Tente novamente.',
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
