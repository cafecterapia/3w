'use client';

import Link from 'next/link';
import { PricingWidget } from '@/components/features/pricing-widget';

interface Subscription {
  status: string;
  type?: 'mensal' | 'avulsa';
  creditsRemaining?: number;
  nextBillingDate?: Date | null;
  nextAmount?: number | null;
}

interface SubscriptionStatusWidgetProps {
  subscription: Subscription | null;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-card-foreground)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        padding: 16,
      }}
      className="mb-8 sm:mb-10"
    >
      {children}
      <style jsx global>{`
        @supports (backdrop-filter: blur(8px)) {
          section {
            background-color: color-mix(
              in oklab,
              var(--color-card) 88%,
              transparent
            );
            backdrop-filter: saturate(160%) blur(8px);
          }
        }
      `}</style>
    </section>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-foreground)',
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
        transition:
          'background-color 160ms ease, border-color 160ms ease, transform 120ms ease',
      }}
    >
      {label}
    </Link>
  );
}

export function SubscriptionStatusWidget({
  subscription,
}: SubscriptionStatusWidgetProps) {
  const inactive =
    !subscription ||
    subscription.status === 'inactive' ||
    subscription.status === 'cancelled' ||
    subscription.status === 'canceled' ||
    subscription.status === 'PENDING' ||
    subscription.status === 'PAST_DUE';

  // Show pending payment status
  if (
    subscription &&
    (subscription.status === 'PENDING' || subscription.status === 'PAST_DUE')
  ) {
    return (
      <Card>
        <div
          style={{
            display: 'grid',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-foreground)',
              letterSpacing: 0.1,
            }}
          >
            {subscription.status === 'PENDING'
              ? 'Pagamento Pendente'
              : 'Pagamento em Atraso'}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-gray-600)',
              margin: '0 auto',
              maxWidth: 520,
            }}
          >
            {subscription.status === 'PENDING'
              ? 'Seu pagamento está sendo processado. Isso pode levar alguns minutos.'
              : 'Há um problema com seu pagamento. Por favor, atualize seu método de pagamento.'}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginTop: 8,
            }}
          >
            <ActionLink
              href="/billing"
              label={
                subscription.status === 'PENDING'
                  ? 'Ver Status'
                  : 'Atualizar Pagamento'
              }
            />
          </div>
        </div>
      </Card>
    );
  }

  if (inactive) {
    return (
      <Card>
        <div
          style={{
            display: 'grid',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-foreground)',
              letterSpacing: 0.1,
            }}
          >
            Sem assinatura ativa
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-gray-600)',
              margin: '0 auto',
              maxWidth: 520,
            }}
          >
            Escolha um pacote de aulas para começar.
          </p>

          <div style={{ marginTop: 8 }}>
            <PricingWidget
              showHeader={false}
              className="max-w-md mx-auto"
              redirectToPayment={true}
              initialClassCount={2}
            />
          </div>
        </div>
      </Card>
    );
  }

  const nextBillText = subscription.nextBillingDate
    ? new Date(subscription.nextBillingDate).toLocaleDateString()
    : null;

  return (
    <Card>
      <div
        style={{
          display: 'grid',
          gap: 12,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-foreground)',
            letterSpacing: 0.1,
          }}
        >
          Assinatura ativa
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-gray-600)',
            margin: '0 auto',
            maxWidth: 520,
          }}
        >
          {subscription.type === 'mensal' ? 'Assinatura mensal' : 'Créditos avulsos'} • {subscription.creditsRemaining || 0} aulas restantes
        </p>

        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 12 }}
        >
          <ActionLink href="/calendar" label="Agendar Aulas" />
          {subscription.creditsRemaining && subscription.creditsRemaining <= 2 && (
            <ActionLink href="/billing" label="Comprar Mais Aulas" />
          )}
        </div>
      </div>
    </Card>
  );
}
