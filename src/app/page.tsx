import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '3W | Modern, Minimal, Semantic Web Apps',
  description:
    'A minimal Next.js 15 starter project using Tailwind CSS v4, built with the App Router for modern, high-performance web applications.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-8 text-primary">3W</h1>
          <p className="text-xl text-accent mb-12 max-w-2xl mx-auto">
            Aplicativo mínimo para controlar assinaturas, cobranças e
            notificações.
          </p>

          {/* --- BOTÃO DE LOGIN--- */}
          <div className="flex justify-center mb-16">
            <Link href="/login">
              <Button size="lg">Acessar Plataforma</Button>
            </Link>
          </div>
          {/* ------------------------------------ */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Card>
              <CardHeader>
                <CardTitle>Moderno</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Construído com o mais recente Next.js e recursos do React 19.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mínimo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Design minimalista com foco na simplicidade e usabilidade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Semântico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acessibilidade e SEO aprimorados com HTML semântico e
                  estrutura clara.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
