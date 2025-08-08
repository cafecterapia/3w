'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePushManager } from '@/hooks/use-push-manager';

type UserLite = {
  id: string;
  name: string | null;
  email: string | null;
  cpf: string | null;
  subscriptionStatus: string | null;
} | null;

export default function SettingsClient({ user }: { user: UserLite }) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');

  // Preferences
  const brazilTimezones = useMemo(
    () => [
      'America/Sao_Paulo',
      'America/Bahia',
      'America/Belem',
      'America/Boa_Vista',
      'America/Campo_Grande',
      'America/Cuiaba',
      'America/Fortaleza',
      'America/Maceio',
      'America/Manaus',
      'America/Porto_Velho',
      'America/Recife',
      'America/Rio_Branco',
      'America/Santarem',
    ],
    []
  );
  const [language, setLanguage] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [theme, setTheme] = useState<'default' | 'light' | 'dark'>('default');

  // Notifications (local prefs)
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [billingAlerts, setBillingAlerts] = useState(true);
  const [classMaterial, setClassMaterial] = useState(true);

  // Push notifications via PWA
  const {
    isSupported: pushSupported,
    isSubscribed,
    loading: pushLoading,
    error: pushError,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePushManager();

  useEffect(() => {
    // Load preferences from localStorage
    try {
      const saved = JSON.parse(
        localStorage.getItem('user:preferences') || 'null'
      );
      if (saved) {
        setLanguage(saved.language ?? 'pt-BR');
        if (brazilTimezones.includes(saved.timezone)) {
          setTimezone(saved.timezone);
        }
        setReduceMotion(!!saved.reduceMotion);
        if (['default', 'light', 'dark'].includes(saved.theme)) {
          setTheme(saved.theme);
        }
      }
      const notif = JSON.parse(
        localStorage.getItem('user:notifications') || 'null'
      );
      if (notif) {
        setEmailUpdates(!!notif.emailUpdates);
        setBillingAlerts(!!notif.billingAlerts);
        setClassMaterial(!!notif.classMaterial);
      }
    } catch (e) {
      // ignore
    }
  }, [brazilTimezones]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || 'Falha ao salvar.');
      window.alert('Perfil atualizado com sucesso.');
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const onUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const currentPassword = String(fd.get('currentPassword') || '');
    const newPassword = String(fd.get('newPassword') || '');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || 'Não foi possível atualizar a senha.');
      (e.currentTarget as HTMLFormElement).reset();
      window.alert('Senha atualizada com sucesso.');
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const onSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { language, timezone, reduceMotion, theme };
      localStorage.setItem('user:preferences', JSON.stringify(payload));
      window.alert('Preferências salvas (localmente).');
    } catch (err) {
      window.alert('Falha ao salvar preferências.');
    }
  };

  const onSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { emailUpdates, billingAlerts, classMaterial };
      localStorage.setItem('user:notifications', JSON.stringify(payload));
      window.alert('Notificações salvas.');
    } catch (err) {
      window.alert('Falha ao salvar notificações.');
    }
  };

  const onPauseSubscription = async () => {
    try {
      const res = await fetch('/api/payments/manage-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause_subscription' }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || 'Falha ao pausar.');
      window.alert('Assinatura pausada.');
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const onCancelSubscription = async () => {
    try {
      const res = await fetch('/api/payments/manage-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_subscription' }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || 'Falha ao cancelar.');
      window.alert('Assinatura cancelada.');
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const onDeleteAccount = async () => {
    if (!window.confirm('Tem certeza? Esta ação é irreversível.')) return;
    try {
      const res = await fetch('/api/profile/delete', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || 'Falha ao excluir a conta.');
      window.alert('Conta excluída. Você será desconectado.');
      window.location.href = '/auth/signout';
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const onPrivacyPopup = (action: 'export' | 'download' | 'policy') => {
    const msg =
      action === 'export' || action === 'download'
        ? 'Seus dados estarão a caminho em breve.'
        : 'Política de privacidade em breve.';
    window.alert(msg);
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Configurações da conta
          </h1>
          <p className="mt-2 text-accent">
            Atualize seus dados, preferências e controle da assinatura.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Perfil"
                description="Seu nome, contato e dados básicos."
              />
              <form
                onSubmit={onSaveProfile}
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <Field>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+55 (11) 90000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>

                <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    type="reset"
                    onClick={() => {
                      setName(user?.name ?? '');
                      setEmail(user?.email ?? '');
                      setPhone('');
                    }}
                  >
                    Descartar
                  </Button>
                  <Button type="submit">Salvar alterações</Button>
                </div>
              </form>
            </Card>

            <Card>
              <CardHeader
                title="Segurança"
                description="Atualize sua senha e proteções da conta."
              />
              <form
                onSubmit={onUpdatePassword}
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <Field>
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </Field>
                <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                  <Button variant="ghost" type="reset">
                    Cancelar
                  </Button>
                  <Button type="submit">Atualizar senha</Button>
                </div>
              </form>
            </Card>

            <Card>
              <CardHeader
                title="Preferências"
                description="Idioma, fuso horário e acessibilidade."
              />
              <form
                onSubmit={onSavePreferences}
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <Field>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    id="language"
                    name="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="timezone">Fuso horário</Label>
                  <Select
                    id="timezone"
                    name="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {brazilTimezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field>
                  <Label htmlFor="theme">Tema (em breve)</Label>
                  <Select
                    id="theme"
                    name="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    disabled
                  >
                    <option value="default">Padrão</option>
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </Select>
                </Field>
                <Field>
                  <ToggleRow
                    id="reduced-motion"
                    label="Reduzir animações"
                    description="Minimiza movimentos e transições."
                    defaultChecked={reduceMotion}
                    onChange={(v) => setReduceMotion(v)}
                  />
                </Field>

                <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    type="reset"
                    onClick={() => {
                      setLanguage('pt-BR');
                      setTimezone('America/Sao_Paulo');
                      setReduceMotion(false);
                      setTheme('default');
                    }}
                  >
                    Descartar
                  </Button>
                  <Button type="submit">Salvar preferências</Button>
                </div>
              </form>
            </Card>

            <Card>
              <CardHeader
                title="Notificações"
                description="Escolha como deseja ser avisado."
              />
              <form
                onSubmit={onSaveNotifications}
                className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <ToggleRow
                  id="email-updates"
                  label="Atualizações da conta"
                  description="Receba e-mails sobre atividades importantes."
                  defaultChecked={emailUpdates}
                  onChange={setEmailUpdates}
                />
                <ToggleRow
                  id="billing-alerts"
                  label="Alertas de cobrança"
                  description="Cobranças, vencimentos e pagamentos."
                  defaultChecked={billingAlerts}
                  onChange={setBillingAlerts}
                />
                <ToggleRow
                  id="class-material"
                  label="Materiais da turma"
                  description="Novos materiais e avisos do professor."
                  defaultChecked={classMaterial}
                  onChange={setClassMaterial}
                />

                <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-secondary p-3 sm:col-span-2">
                  <div>
                    <p className="text-sm font-medium">Notificações push</p>
                    <p className="text-xs text-accent mt-1">
                      Receba avisos no navegador.
                    </p>
                    {pushError ? (
                      <p className="text-xs text-red-600 mt-1">{pushError}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-accent">
                      {pushSupported
                        ? isSubscribed
                          ? 'Ativado'
                          : 'Desativado'
                        : 'Não suportado'}
                    </span>
                    <Button
                      as="button"
                      type="button"
                      onClick={
                        isSubscribed ? unsubscribeFromPush : subscribeToPush
                      }
                      disabled={!pushSupported || pushLoading}
                    >
                      {pushLoading
                        ? 'Processando...'
                        : isSubscribed
                          ? 'Desativar'
                          : 'Ativar'}
                    </Button>
                  </div>
                </div>

                <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                  <Button variant="ghost" type="reset">
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar notificações</Button>
                </div>
              </form>
            </Card>
          </section>

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
                <Button
                  as="button"
                  type="button"
                  variant="secondary"
                  onClick={() => onPrivacyPopup('export')}
                >
                  Exportar dados
                </Button>
                <Button
                  as="button"
                  type="button"
                  variant="secondary"
                  onClick={() => onPrivacyPopup('download')}
                >
                  Baixar meus dados
                </Button>
                <Button
                  as="button"
                  type="button"
                  variant="ghost"
                  onClick={() => onPrivacyPopup('policy')}
                >
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
                <Button
                  as="button"
                  type="button"
                  variant="danger"
                  onClick={onPauseSubscription}
                >
                  Pausar assinatura
                </Button>
                <Button
                  as="button"
                  type="button"
                  variant="danger"
                  onClick={onCancelSubscription}
                >
                  Cancelar assinatura
                </Button>
                <Button
                  as="button"
                  type="button"
                  variant="danger-ghost"
                  onClick={onDeleteAccount}
                >
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
      className="w-full appearance-none rounded-md border border-border bg-secondary/50 px-4 py-2.5 text-base outline-none focus:border-foreground focus:ring-0 disabled:opacity-60"
    />
  );
}

function ToggleRow({
  id,
  label,
  description,
  defaultChecked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
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
        onChange={(e) => onChange?.(e.target.checked)}
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
    danger: 'bg-foreground text-secondary hover:opacity-90',
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
