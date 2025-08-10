'use client';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6 text-center p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Algo deu errado</h1>
      <p className="text-accent text-sm max-w-md leading-relaxed">
        Ocorreu um erro inesperado.{` `}
        {error?.message || 'Tente novamente mais tarde.'}
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary text-secondary px-5 py-3 text-sm font-medium tracking-tight hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Voltar ao início
        </Link>
        {reset && (
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium tracking-tight hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
