// app/settings/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Configurações — Portal do Aluno',
  description: 'Gerencie sua conta, preferências e assinatura.',
};

export default function SettingsPage() {
  // Replace with real user, plan, and preference data
  const user = {
    name: 'Aluno',
    email: 'aluno@exemplo.com',
    phone: '',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Header */}
        <header className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Configurações da conta
          </h1>
          <p className="mt-2 text-accent">
            Atualize seus dados, preferências e controle da assinatura.
          </p>
        </header>

        {/* Two-column layout: primary settings + side actions */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            {/* Perfil */}
            <Card>
              <CardHeader
                title="Perfil"
                description="Seu nome, contato e dados básicos."
              />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" name="name" defaultValue={user.name} />
                </Field>

                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+55 (11) 90000-0000"
                    defaultValue={user.phone}
                  />
                </Field>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="ghost" type="reset">
                  Descartar
                </Button>
                <Button type="submit">Salvar alterações</Button>
              </div>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader
                title="Segurança"
                description="Atualize sua senha e proteções da conta."
              />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    placeholder="••••••••"
                  />
                </Field>
                <Field>
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                  />
                </Field>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="ghost" type="reset">
                  Cancelar
                </Button>
                <Button type="submit">Atualizar senha</Button>
              </div>
            </Card>

            {/* Preferências */}
            <Card>
              <CardHeader
                title="Preferências"
                description="Idioma, fuso horário e acessibilidade."
              />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    id="language"
                    name="language"
                    defaultValue={user.language}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="timezone">Fuso horário</Label>
                  <Select
                    id="timezone"
                    name="timezone"
                    defaultValue={user.timezone}
                  >
                    <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </Select>
                </Field>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ToggleRow
                  id="reduced-motion"
                  label="Reduzir animações"
                  description="Minimiza movimentos e transições."
                  defaultChecked={false}
                />
                <ToggleRow
                  id="high-contrast"
                  label="Alto contraste"
                  description="Aprimora o contraste de cores."
                  defaultChecked={false}
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="ghost" type="reset">
                  Descartar
                </Button>
                <Button type="submit">Salvar preferências</Button>
              </div>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader
                title="Notificações"
                description="Escolha como deseja ser avisado."
              />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ToggleRow
                  id="email-updates"
                  label="Atualizações da conta"
                  description="Receba e-mails sobre atividades importantes."
                  defaultChecked
                />
                <ToggleRow
                  id="billing-alerts"
                  label="Alertas de cobrança"
                  description="Cobranças, vencimentos e pagamentos."
                  defaultChecked
                />
                <ToggleRow
                  id="class-material"
                  label="Materiais da turma"
                  description="Novos materiais e avisos do professor."
                  defaultChecked
                />
                <ToggleRow
                  id="push-notifications"
                  label="Notificações push"
                  description="Receba avisos no navegador."
                  defaultChecked={false}
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="ghost" type="reset">
                  Cancelar
                </Button>
                <Button type="submit">Salvar notificações</Button>
              </div>
            </Card>
          </section>

          {/* Sidebar actions */}
          <aside className="space-y-6">
            <Card>
              <CardHeader
                title="Assinatura"
                description="Gerencie seu plano e pagamentos."
              />
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Button as={Link} href="/billing/manage">
                  Gerenciar pagamentos
                </Button>
                <Button as={Link} href="/billing/invoices" variant="secondary">
                  Ver faturas
                </Button>
                <Button as={Link} href="/billing/manage" variant="ghost">
                  Métodos de pagamento
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Privacidade"
                description="Controle a visibilidade e os dados."
              />
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Button as="button" type="button" variant="secondary">
                  Exportar dados
                </Button>
                <Button as="button" type="button" variant="secondary">
                  Baixar meus dados
                </Button>
                <Button as="button" type="button" variant="ghost">
                  Política de privacidade
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Encerrar"
                description="Ações avançadas da conta."
              />
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Button as="button" type="button" variant="danger">
                  Pausar assinatura
                </Button>
                <Button as="button" type="button" variant="danger">
                  Cancelar assinatura
                </Button>
                <Button as="button" type="button" variant="danger-ghost">
                  Excluir conta
                </Button>
              </div>
              <p className="mt-2 text-xs text-accent">
                Estas ações podem ser irreversíveis. Confirme antes de
                continuar.
              </p>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* Primitives */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-secondary/50 p-5 sm:p-6">
      {children}
    </section>
  );
}

function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-accent">{description}</p>
      ) : null}
    </header>
  );
}

function Field({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
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
          <p className="text-xs text-accent mt-1">{description}</p>
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

type ButtonProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      as?: 'button';
      href?: never;
    })
  | ({ as: typeof Link; href: string } & Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href'
    >)
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' });

function Button({
  as,
  href,
  children,
  variant = 'primary',
  ...rest
}: ButtonProps & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
}) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';
  const map: Record<string, string> = {
    primary: 'bg-primary text-secondary hover:opacity-90',
    secondary: 'border border-border bg-secondary hover:bg-muted',
    ghost: 'text-foreground hover:underline underline-offset-4',
    danger: 'bg-foreground text-secondary hover:opacity-90', // consider semantic danger in theme if available
    'danger-ghost':
      'text-foreground/80 hover:text-foreground underline underline-offset-4',
  };

  if (as === Link) {
    return (
      <Link
        href={href!}
        {...(rest as any)}
        className={`${base} ${map[variant]}`}
      >
        {children}
      </Link>
    );
  }

  if (as === 'a') {
    return (
      <a href={href} {...(rest as any)} className={`${base} ${map[variant]}`}>
        {children}
      </a>
    );
  }

  return (
    <button {...(rest as any)} className={`${base} ${map[variant]}`}>
      {children}
    </button>
  );
}
