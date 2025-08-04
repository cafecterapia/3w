// app/support/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Suporte — Portal do Aluno',
  description: 'Central de ajuda, contato e status do serviço.',
};

export default function SupportPage() {
  // Mocked data placeholders — substitute with real integrations
  const faqs = [
    {
      q: 'Como altero meu plano de assinatura?',
      a: 'Acesse Billing > Gerenciar assinatura para mudar de plano, atualizar forma de pagamento ou pausar/cancelar.',
    },
    {
      q: 'Onde encontro minhas faturas?',
      a: 'Vá em Billing > Faturas para ver, baixar e solicitar 2ª via das faturas.',
    },
    {
      q: 'Não recebo e-mails do portal. O que fazer?',
      a: 'Verifique a pasta de spam e confirme as preferências em Configurações > Notificações. Adicione nosso domínio à lista segura.',
    },
    {
      q: 'Como habilitar notificações?',
      a: 'Em Configurações > Notificações, ative e-mails e, se preferir, habilite push no navegador.',
    },
  ];

  const resources = [
    { href: '/billing', label: 'Gerenciar assinatura' },
    { href: '/billing/invoices', label: 'Ver faturas' },
    { href: '/settings', label: 'Preferências e notificações' },
    { href: '/settings#privacy', label: 'Privacidade e dados' },
    { href: '/dashboard', label: 'Voltar ao painel' },
  ];

  const contactMethods = [
    {
      label: 'E-mail de suporte',
      value: 'suporte@portaldoaluno.com',
      href: 'mailto:suporte@portaldoaluno.com',
    },
    {
      label: 'Status do serviço',
      value: 'status.portaldoaluno.com',
      href: 'https://status.portaldoaluno.com',
    },
    {
      label: 'Base de conhecimento',
      value: 'docs.portaldoaluno.com',
      href: 'https://docs.portaldoaluno.com',
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Header */}
        <header className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Suporte
          </h1>
          <p className="mt-2 text-accent">
            Encontre respostas rápidas, acompanhe o status e fale com nossa
            equipe.
          </p>

          {/* Global search (stub) */}
          <div className="mt-6">
            <label htmlFor="support-search" className="sr-only">
              Pesquisar na central de suporte
            </label>
            <div className="relative">
              <input
                id="support-search"
                name="q"
                type="search"
                placeholder="Pesquise por faturas, assinatura, notificações…"
                autoComplete="off"
                className="w-full rounded-md border border-border bg-secondary/50 px-4 py-3 pr-10 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0"
                aria-describedby="support-search-help"
              />
              <span id="support-search-help" className="sr-only">
                Pressione Enter para pesquisar
              </span>
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-accent">
                Enter
              </kbd>
            </div>
          </div>
        </header>

        {/* Grid: Quick actions + Status + Contact */}
        <section aria-labelledby="atalhos-e-status" className="mb-10 sm:mb-12">
          <h2 id="atalhos-e-status" className="sr-only">
            Atalhos e status do serviço
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {/* Atalhos úteis */}
            <Card className="md:col-span-2">
              <CardTitle>Ações rápidas</CardTitle>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {resources.map((r) => (
                  <QuickAction key={r.href} href={r.href}>
                    {r.label}
                  </QuickAction>
                ))}
              </div>
            </Card>

            {/* Status do serviço */}
            <Card>
              <CardTitle>Status do serviço</CardTitle>
              <p className="mt-2 text-sm text-accent">
                Todos os sistemas operando normalmente.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500"
                  aria-hidden
                />
                <span className="text-sm">Operacional</span>
              </div>
              <div className="mt-4">
                <Link
                  href="https://status.portaldoaluno.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-foreground hover:underline underline-offset-4"
                >
                  Ver histórico e incidentes
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq">
          <h2
            id="faq"
            className="text-lg sm:text-xl font-semibold tracking-tight"
          >
            Perguntas frequentes
          </h2>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {/* Listagem de FAQ */}
          <Card className="md:col-span-2">
            <ul className="divide-y divide-border">
              {faqs.map((item, idx) => (
                <li key={idx} className="py-4">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <span className="text-base font-medium">{item.q}</span>
                      <span
                        aria-hidden
                        className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded border border-border text-xs text-accent group-open:rotate-45 transition-transform"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-accent leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </Card>

          {/* Contato e horários */}
          <Card as="aside">
            <CardTitle>Fale conosco</CardTitle>
            <ul className="mt-3 space-y-3 text-sm">
              {contactMethods.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary p-3"
                >
                  <div>
                    <p className="font-medium">{c.label}</p>
                    <p className="text-accent">{c.value}</p>
                  </div>
                  <Link
                    href={c.href}
                    className="rounded-md border border-border bg-secondary px-3 py-1.5 hover:bg-muted"
                  >
                    Abrir
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <CardTitle>Horário de atendimento</CardTitle>
              <p className="mt-2 text-sm text-accent">
                Segunda a sexta, 9h–18h (GMT-3). Resposta em até 1 dia útil.
              </p>
            </div>
          </Card>
        </div>

        {/* Formulário de contato acessível */}
        <section aria-labelledby="contato" className="mt-10 sm:mt-12">
          <h2
            id="contato"
            className="text-lg sm:text-xl font-semibold tracking-tight"
          >
            Enviar uma solicitação
          </h2>

          <form className="mt-4 grid grid-cols-1 gap-4 sm:gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="name">Seu nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nome completo"
                  autoComplete="name"
                />
              </Field>

              <Field>
                <Label htmlFor="email">Seu e-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="topic">Assunto</Label>
              <Select id="topic" name="topic" defaultValue="billing">
                <option value="billing">Cobrança e faturas</option>
                <option value="subscription">Assinatura</option>
                <option value="notifications">Notificações</option>
                <option value="account">Conta e segurança</option>
                <option value="other">Outro</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Descreva sua solicitação com detalhes."
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ToggleRow
                id="consent"
                label="Concordo em ser contatado por e-mail"
                description="Usaremos seu e-mail apenas para responder a esta solicitação."
                defaultChecked
              />
              <ToggleRow
                id="attach-logs"
                label="Anexar informações técnicas"
                description="Inclui dados básicos do navegador para diagnóstico."
                defaultChecked={false}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="reset" variant="ghost">
                Limpar
              </Button>
              <Button type="submit">Enviar</Button>
            </div>
          </form>
        </section>

        {/* Rodapé de ajuda */}
        <footer className="mt-12">
          <p className="text-xs text-accent">
            Precisa de respostas rápidas? Use a pesquisa no topo desta página ou
            visite a base de conhecimento.
          </p>
        </footer>
      </div>
    </main>
  );
}

/* Primitives */
function Card({
  children,
  className = '',
  as: Tag = 'section',
}: {
  children: React.ReactNode;
  className?: string;
  as?: any;
}) {
  return (
    <Tag
      className={`rounded-lg border border-border bg-secondary/50 p-5 sm:p-6 ${className}`}
    >
      {children}
    </Tag>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold tracking-tight">{children}</h3>;
}

function QuickAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-3 py-2 text-sm hover:bg-muted"
    >
      {children}
    </Link>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className="mb-1 block text-sm font-medium" />;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-border bg-secondary/50 px-4 py-2.5 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full appearance-none rounded-md border border-border bg-secondary/50 px-4 py-2.5 text-base outline-none focus:border-foreground focus:ring-0"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-md border border-border bg-secondary/50 px-4 py-2.5 text-base outline-none placeholder:text-accent focus:border-foreground focus:ring-0"
    />
  );
}

function ToggleRow({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-secondary p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="mt-1 text-xs text-accent">{description}</p>
        ) : null}
      </div>
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 cursor-pointer rounded border-border accent-foreground"
        aria-label={label}
      />
    </div>
  );
}

function Button({
  children,
  variant = 'primary',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
}) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';
  const map: Record<string, string> = {
    primary: 'bg-primary text-secondary hover:opacity-90',
    ghost: 'text-foreground hover:underline underline-offset-4',
  };
  return (
    <button {...rest} className={`${base} ${map[variant]}`}>
      {children}
    </button>
  );
}
