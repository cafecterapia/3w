import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

// Universal NextAuth v5 configuration with unified auth() helper
const authConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/login',
    signOut: '/signout',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Updated typings in NextAuth v5 mark credential values as unknown / possibly {}.
        const email =
          typeof credentials?.email === 'string'
            ? credentials.email
            : undefined;
        const password =
          typeof credentials?.password === 'string'
            ? credentials.password
            : undefined;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: (user as any).role || 'USER',
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID || '',
      clientSecret: process.env.AUTH_GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = (user as any).id;
        token.role = (user as any).role || 'USER';
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || 'USER';
      }
      return session;
    },
  },
};

export const authOptions = authConfig; // backward compatibility if referenced elsewhere

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
export const { GET, POST } = handlers;
