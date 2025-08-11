import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PaymentSettingsForm } from '@/components/admin/payment-settings-form';

export default async function PaymentSettingsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-600">
          Configure your EFI payment gateway to receive money from
          subscriptions.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <PaymentSettingsForm />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          🏦 How to Connect Your Bank Account
        </h3>
        <div className="text-blue-800 space-y-2 text-sm">
          <p>
            <strong>1. Create an EFI Account:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              Visit{' '}
              <a
                href="https://app.gerencianet.com.br"
                target="_blank"
                className="underline"
              >
                app.gerencianet.com.br
              </a>
            </li>
            <li>Create a business account with your bank details</li>
            <li>Complete the verification process</li>
          </ul>

          <p>
            <strong>2. Get API Credentials:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Go to API section in your EFI dashboard</li>
            <li>Generate Client ID and Client Secret</li>
            <li>
              Set up webhook URL:{' '}
              <code className="bg-blue-100 px-1 rounded">
                {/* Use dynamic base URL resolution to avoid hard-coding */}
                {`${process.env.NEXTAUTH_URL || (typeof window === 'undefined' ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000') : window.location.origin)}/api/webhooks/efi`}
              </code>
            </li>
          </ul>

          <p>
            <strong>3. Bank Integration:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Link your business bank account in EFI dashboard</li>
            <li>Set up automatic transfers (usually next business day)</li>
            <li>Configure tax settings (if applicable)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
