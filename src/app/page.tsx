import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* Container */}
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        {/* Hero */}
        <section
          aria-labelledby="hero-title"
          className="pb-20 sm:pb-28 border-b border-border"
        >
          <div className="space-y-6">
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl font-semibold tracking-tight"
            >
              Portal do Aluno
            </h1>
            <p className="max-w-2xl text-base sm:text-lg text-accent leading-relaxed">
              Gerencie faturas, assinaturas e notificações em um só lugar — com
              clareza, segurança e autonomia.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary text-secondary px-5 py-3 text-sm font-medium tracking-tight hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Criar Minha Conta
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:underline underline-offset-4"
              >
                Faça Login
              </Link>
            </div>
          </div>
        </section>

        {/* Como Começar */}
        <section
          aria-labelledby="como-comecar-title"
          className="py-20 sm:py-28 border-b border-border"
        >
          <div className="space-y-10">
            <h2
              id="como-comecar-title"
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
            >
              Como Começar
            </h2>

            <ol className="grid gap-10 sm:grid-cols-3 sm:gap-12">
              <li className="space-y-3">
                <div className="text-sm font-semibold text-accent">Passo 1</div>
                <h3 className="text-lg font-medium">Crie sua conta</h3>
                <p className="text-sm text-accent leading-relaxed">
                  Cadastre-se com seu e-mail institucional para acessar o portal
                  com segurança.
                </p>
              </li>

              <li className="space-y-3">
                <div className="text-sm font-semibold text-accent">Passo 2</div>
                <h3 className="text-lg font-medium">Ative sua assinatura</h3>
                <p className="text-sm text-accent leading-relaxed">
                  Escolha o plano e conclua o pagamento. Faturas ficam
                  disponíveis no seu perfil.
                </p>
              </li>

              <li className="space-y-3">
                <div className="text-sm font-semibold text-accent">Passo 3</div>
                <h3 className="text-lg font-medium">Habilite notificações</h3>
                <p className="text-sm text-accent leading-relaxed">
                  Receba lembretes sobre vencimentos, confirmações e
                  atualizações importantes.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* Pricing Preview */}
        <section
          aria-labelledby="pricing-title"
          className="py-20 sm:py-28 border-b border-border"
        >
          <div className="space-y-10">
            <div className="text-center">
              <h2
                id="pricing-title"
                className="text-2xl sm:text-3xl font-semibold tracking-tight"
              >
                Planos Flexíveis
              </h2>
              <p className="mt-4 text-base sm:text-lg text-accent max-w-2xl mx-auto">
                Escolha quantas aulas você quer por mês. Quanto mais aulas,
                maior o desconto!
              </p>
            </div>
          </div>
        </section>

        {/* Mensagem do professor */}
        <section
          aria-labelledby="mensagem-prof-title"
          className="py-20 sm:py-28"
        >
          <div className="max-w-3xl">
            <h2
              id="mensagem-prof-title"
              className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8"
            >
              Uma mensagem do seu professor
            </h2>

            <blockquote className="space-y-6">
              <p className="text-lg sm:text-xl leading-relaxed">
                “Criei este portal para centralizar tarefas administrativas —
                pagamentos, assinaturas e avisos — para que possamos dedicar
                mais tempo ao que importa: ensinar e aprender, sem distrações.”
              </p>
              <footer className="pt-2">
                <div className="h-px w-16 bg-border mb-4" />
                <cite className="not-italic text-sm text-accent">Luiz</cite>
              </footer>
            </blockquote>
          </div>
        </section>
      </div>
    </main>
  );
}
