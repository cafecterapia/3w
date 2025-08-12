'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestEFIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/admin/efi-status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus({ error: 'Failed to load status' });
      }
    } catch (e) {
      setStatus({ error: 'Failed to load status' });
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/test-efi-connection', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to test connection' });
    } finally {
      setLoading(false);
    }
  };

  const createTestSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/test-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 2990 }), // R$ 29.90
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create test subscription' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">EFI Payment System Test</h1>
        <p className="text-gray-600 mt-2">
          Test your EFI integration and create sample payments
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">EFI Configuration Status</h2>
          <div className="mb-4 text-sm text-gray-600">
            Live view of environment & connectivity. Refresh after changing env vars / redeploy.
          </div>
          <Button variant="outline" className="mb-4" onClick={loadStatus} disabled={statusLoading}>
            {statusLoading ? 'Refreshing...' : 'Refresh Status'}
          </Button>
          {status ? (
            status.error ? (
              <div className="text-red-600 text-sm">{status.error}</div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <StatusRow label="Client ID" value={status.status.clientId} />
                  <StatusRow label="Client Secret" value={status.status.clientSecret} />
                  <StatusRow label="PIX Key" value={status.status.pixKey} />
                  <StatusRow label="Webhook Secret" value={status.status.webhookSecret} />
                  <StatusRow label="Cert Path" value={!!status.status.certificatePath} raw={status.status.certificatePath} />
                  <StatusRow label="Cert Exists" value={status.status.certificateExists} />
                  <StatusRow label="Passphrase Set" value={status.status.hasPassphrase} />
                  <StatusRow label="Environment" value={status.status.environment} raw={status.status.environment} />
                </div>
                <div>
                  <Badge ok={status.validation.ok} label={status.validation.ok ? 'Config OK' : 'Config Issues'} />
                  {!status.validation.ok && (
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-red-600">
                      {status.validation.issues.map((i: string) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <Badge ok={status.connectivity.ok} label={status.connectivity.ok ? 'Connectivity OK' : 'Connectivity Failed'} />
                  <span className="ml-2">{status.connectivity.message}</span>
                </div>
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500">Loading status...</div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <p className="text-gray-600 mb-4">
            Test if your EFI credentials are working correctly.
          </p>
          <Button
            onClick={testConnection}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test EFI Connection'}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Create Test Subscription
          </h2>
          <p className="text-gray-600 mb-4">
            Create a test subscription for R$ 29.90 to verify the complete flow.
          </p>
          <Button
            onClick={createTestSubscription}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Test Subscription'}
          </Button>
        </Card>

        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {result.success ? '✅ Success' : '❌ Error'}
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
            {result.subscription?.payment_url && (
              <div className="mt-4">
                <p className="font-medium mb-2">Payment Link:</p>
                <a
                  href={result.subscription.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {result.subscription.payment_url}
                </a>
              </div>
            )}
          </Card>
        )}

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            📋 Testing Checklist
          </h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <span>Test EFI connection to verify credentials are working</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <span>Create a test subscription to generate a payment link</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <span>Use the payment link to test the payment flow</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <span>Check if webhooks are received (monitor console logs)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">5.</span>
              <span>Verify user subscription status updates correctly</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusRow({ label, value, raw }: { label: string; value: any; raw?: any }) {
  const display = raw ? raw : value ? 'Yes' : 'No';
  const color = value || raw ? 'text-green-700' : 'text-red-700';
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${color}`}>{display}</span>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs ${ok ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
      {label}
    </span>
  );
}
