import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3W',
  description: 'A minimal Next.js application with Tailwind CSS v4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
