import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 text-center p-8">
      <h1 className="text-4xl font-semibold tracking-tight">
        Página não encontrada
      </h1>
      <p className="text-accent max-w-md text-sm leading-relaxed">
        A página que você tentou acessar não existe ou foi movida. Verifique o
        endereço ou volte para o início.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary text-secondary px-5 py-3 text-sm font-medium tracking-tight hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
