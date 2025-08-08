import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Providers from '@/components/providers';
import './globals.css';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

/**
 * Font Optimization:
 *
 * Using `next/font` to load the Inter font. This is a crucial performance
 * optimization in Next.js. It automatically hosts the font files, removes
 * external network requests, and prevents Cumulative Layout Shift (CLS) by
 * pre-calculating font display properties.
 */
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // CSS variable for easy use in Tailwind
});

/**
 * Root Metadata:
 *
 * This metadata object is the foundation for your application's SEO.
 * It provides default values that can be extended or overridden by child pages.
 * The `template` property is particularly useful for creating consistent page titles.
 */
export const metadata: Metadata = {
  title: {
    default: '3W - Modern Web Applications',
    template: `%s | 3W`,
  },
  description:
    'A minimal Next.js application built with Tailwind CSS v4, Prisma, and the App Router.',
  // Provides hints to the browser about the application
  applicationName: '3W',
  authors: [{ name: 'Your Name or Company', url: 'https://example.com' }],
  keywords: ['Next.js', 'Tailwind CSS', 'Prisma', 'Subscription', 'SaaS'],
};

/**
 * Viewport Configuration:
 *
 * This new object in Next.js allows you to control the viewport and set
 * theme colors for the browser UI (like the status bar on mobile).
 * This is essential for a polished PWA-like experience.
 */
export const viewport: Viewport = {
  themeColor: '#ffffff', // Corresponds to your --color-background
  colorScheme: 'light',
};

/**
 * Root Layout Component:
 *
 * This is the main shell for your entire application. It sets up the global
 * HTML structure, applies the base font, and renders child components.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The nested pages or layouts.
 * @returns {JSX.Element} The root layout structure.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        {/*
          Global providers for session management and state management.
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
