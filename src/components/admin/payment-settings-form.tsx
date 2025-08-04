'use client';

import { useState } from 'react';

interface PaymentSettings {
  efiClientId: string;
  efiClientSecret: string;
  efiEnvironment: 'sandbox' | 'production';
  efiWebhookSecret: string;
  bankAccount: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
  };
}

export function PaymentSettingsForm() {
  const [settings, setSettings] = useState<PaymentSettings>({
    efiClientId: '',
    efiClientSecret: '',
    efiEnvironment: 'sandbox',
    efiWebhookSecret: '',
    bankAccount: {
      bank: '',
      agency: '',
      account: '',
      accountType: 'checking',
    },
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    try {
      // In a real implementation, you'd save to database or update environment
      alert('Payment settings saved! Please update your .env.local file with these values.');
      console.log('Settings to save:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Test EFI API connection
      const response = await fetch('/api/admin/test-efi-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: settings.efiClientId,
          clientSecret: settings.efiClientSecret,
          environment: settings.efiEnvironment,
        }),
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* EFI API Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">EFI API Configuration</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={settings.efiClientId}
              onChange={(e) => setSettings(prev => ({ ...prev, efiClientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your EFI Client ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={settings.efiClientSecret}
              onChange={(e) => setSettings(prev => ({ ...prev, efiClientSecret: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your EFI Client Secret"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              value={settings.efiEnvironment}
              onChange={(e) => setSettings(prev => ({ ...prev, efiEnvironment: e.target.value as 'sandbox' | 'production' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Live)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Secret
            </label>
            <input
              type="password"
              value={settings.efiWebhookSecret}
              onChange={(e) => setSettings(prev => ({ ...prev, efiWebhookSecret: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your EFI Webhook Secret"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used to verify webhook signatures for security
            </p>
          </div>
        </div>
      </div>

      {/* Bank Account Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={settings.bankAccount.bank}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                bankAccount: { ...prev.bankAccount, bank: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Banco do Brasil, Itaú, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency
            </label>
            <input
              type="text"
              value={settings.bankAccount.agency}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                bankAccount: { ...prev.bankAccount, agency: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agency number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={settings.bankAccount.account}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                bankAccount: { ...prev.bankAccount, account: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={settings.bankAccount.accountType}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                bankAccount: { ...prev.bankAccount, accountType: e.target.value as 'checking' | 'savings' }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="checking">Checking Account</option>
              <option value="savings">Savings Account</option>
            </select>
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Test Connection</h3>
            <p className="text-sm text-gray-600">
              Verify that your EFI credentials are working correctly
            </p>
          </div>
          <button
            onClick={testConnection}
            disabled={isTestingConnection || !settings.efiClientId || !settings.efiClientSecret}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {connectionStatus !== 'idle' && (
          <div className={`mt-4 p-4 rounded-md ${
            connectionStatus === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {connectionStatus === 'success' ? (
              <>
                <strong>✅ Connection Successful!</strong>
                <p>Your EFI credentials are working correctly.</p>
              </>
            ) : (
              <>
                <strong>❌ Connection Failed</strong>
                <p>Please check your credentials and try again.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="border-t pt-6">
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Save Payment Settings
        </button>
      </div>

      {/* Environment Variables Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-2">
          📝 Environment Variables (.env.local)
        </h4>
        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`EFI_CLIENT_ID=${settings.efiClientId || 'your-efi-client-id'}
EFI_CLIENT_SECRET=${settings.efiClientSecret || 'your-efi-client-secret'}
EFI_ENVIRONMENT=${settings.efiEnvironment}
EFI_WEBHOOK_SECRET=${settings.efiWebhookSecret || 'your-efi-webhook-secret'}`}
        </pre>
        <p className="text-xs text-gray-600 mt-2">
          Copy these values to your .env.local file after testing the connection.
        </p>
      </div>
    </div>
  );
}
