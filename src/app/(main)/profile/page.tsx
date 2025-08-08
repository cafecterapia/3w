// app/profile/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect('/login');

  const user = session.user;
  const initials =
    user?.name?.trim()?.slice(0, 1).toUpperCase() ||
    user?.email?.trim()?.slice(0, 1).toUpperCase() ||
    '?';

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        {/* Header */}
        <header className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Meu Perfil
            </h1>
            <p className="mt-2 text-accent">
              Gerencie sua identidade, preferências e acesso com segurança.
            </p>
          </div>

          {/* Hero avatar */}
          <div className="flex items-center gap-4">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Foto do perfil"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-medium"
              >
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user?.name || 'Usuário'}
              </p>
              <p className="truncate text-xs text-accent">
                {user?.email || 'Email não informado'}
              </p>
            </div>
          </div>
        </header>

        {/* Profile overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Identity and contact */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadOnlyField
                label="Nome"
                value={user?.name || 'Não informado'}
              />
              <ReadOnlyField
                label="E-mail"
                value={user?.email || 'Não informado'}
              />
              <ReadOnlyField
                className="sm:col-span-2"
                label="Foto do perfil"
                value={
                  user?.image
                    ? 'Conectada via provedor'
                    : 'Usando inicial do nome'
                }
                renderValue={
                  <div className="flex items-center gap-4">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt="Foto do perfil"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                        {initials}
                      </div>
                    )}
                    <span className="text-sm text-accent">
                      {user?.image
                        ? 'Conectada via provedor'
                        : 'Usando inicial do nome'}
                    </span>
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle>Acesso rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickLink
                href="/settings"
                title="Configurações"
                subtitle="Preferências e segurança"
              />
              <QuickLink
                href="/billing"
                title="Assinatura"
                subtitle="Planos e faturas"
              />
              <QuickLink
                href="/support"
                title="Suporte"
                subtitle="Central de ajuda e contato"
              />
            </CardContent>
          </Card>
        </div>

        {/* Security and sessions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Segurança e sessões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SecurityItem
                  label="Autenticação"
                  description="Conectado via provedor"
                  action={{ href: '/settings', label: 'Gerenciar' }}
                />
                <SecurityItem
                  label="Redefinir senha"
                  description="Altere sua senha com segurança"
                  action={{ href: '/settings', label: 'Atualizar' }}
                />
              </div>

              <div className="rounded-md border border-border bg-secondary p-4">
                <p className="text-sm font-medium">Sessões ativas</p>
                <p className="mt-1 text-xs text-accent">
                  Encerre sessões antigas em caso de suspeita de acesso
                  indevido.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>Este dispositivo • Agora</Pill>
                  <Pill>Chrome • São Paulo</Pill>
                </div>
                <div className="mt-4">
                  <Link
                    href="/settings"
                    className="text-sm hover:underline underline-offset-4"
                  >
                    Ver e gerenciar sessões
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações da conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <PrimaryButton as={Link} href="/settings">
                  Editar configurações
                </PrimaryButton>
                <SecondaryButton as={Link} href="/api/auth/signout">
                  Sair da conta
                </SecondaryButton>
              </div>

              <div className="pt-4 border-t border-border text-xs text-accent space-y-1.5">
                <p>
                  <strong>Conta criada:</strong> Indisponível
                </p>
                <p>
                  <strong>Último acesso:</strong> Agora
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help hint — redesigned */}
        <Card className="border border-border bg-secondary/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground/80"
                aria-hidden
              >
                {/* Minimal inline SVG icon (lightbulb/info hybrid) */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  focusable="false"
                >
                  <path
                    d="M9 18h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 21h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 3a7 7 0 0 0-4.9 11.9c.6.6 1.1 1.5 1.3 2.1l.1.3h7l.1-.3c.2-.6.7-1.5 1.3-2.1A7 7 0 0 0 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>

              <div>
                <p className="text-sm font-medium">
                  Precisa atualizar suas informações?
                </p>
                <p className="text-xs text-accent mt-1">
                  Algumas informações são gerenciadas pelo seu provedor de
                  login. Para alterações, acesse as configurações ou entre em
                  contato com o suporte.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/settings"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-secondary hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    Abrir configurações
                  </Link>
                  <Link
                    href="/support"
                    className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    Falar com suporte
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

{
  /* Local UI helpers */
}
function ReadOnlyField({
  label,
  value,
  className = '',
  renderValue,
}: {
  label: string;
  value?: string;
  className?: string;
  renderValue?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-accent mb-1">
        {label}
      </label>
      {renderValue ? (
        renderValue
      ) : (
        <p className="text-sm bg-muted p-3 rounded-md">{value}</p>
      )}
    </div>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-border bg-secondary p-3 hover:bg-muted"
      aria-label={`${title} — ${subtitle}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-accent">{subtitle}</p>
      </div>
      <span aria-hidden className="text-accent">
        →
      </span>
    </Link>
  );
}

function SecurityItem({
  label,
  description,
  action,
}: {
  label: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-secondary p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="text-xs text-accent mt-0.5">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-sm hover:underline underline-offset-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs">
      {children}
    </span>
  );
}

/* Buttons */
type AnchorLike =
  | ({ as: typeof Link; href: string } & Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href'
    >)
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a'; href: string });

function PrimaryButton(props: AnchorLike & { children: React.ReactNode }) {
  const { children, as, href, ...rest } = props as any;
  const cls =
    'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';
  if (as === Link)
    return (
      <Link href={href} {...rest} className={cls}>
        {children}
      </Link>
    );
  return (
    <a href={href} {...rest} className={cls}>
      {children}
    </a>
  );
}

function SecondaryButton(props: AnchorLike & { children: React.ReactNode }) {
  const { children, as, href, ...rest } = props as any;
  const cls =
    'inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';
  if (as === Link)
    return (
      <Link href={href} {...rest} className={cls}>
        {children}
      </Link>
    );
  return (
    <a href={href} {...rest} className={cls}>
      {children}
    </a>
  );
}
