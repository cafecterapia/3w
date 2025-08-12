// Efi SDK initialization and helper functions
import EfiPay from 'sdk-node-apis-efi';
import { getBaseUrl } from './utils';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

function resolveCertificatePath(): string | undefined {
  if (!process.env.EFI_CERTIFICATE_PATH) return undefined;
  const resolved = path.resolve(process.env.EFI_CERTIFICATE_PATH);
  return resolved;
}

export function getEfiConfigStatus() {
  const certPath = resolveCertificatePath();
  const certExists = certPath ? fs.existsSync(certPath) : false;
  return {
    clientId: !!process.env.EFI_CLIENT_ID,
    clientSecret: !!process.env.EFI_CLIENT_SECRET,
    pixKey: !!process.env.EFI_PIX_KEY,
    webhookSecret: !!process.env.EFI_WEBHOOK_SECRET,
    certificatePath: certPath,
    certificateExists: certExists,
    hasPassphrase: (process.env.EFI_CERTIFICATE_PASSWORD || '') !== '',
    environment: process.env.EFI_ENVIRONMENT || 'unset',
    sandbox: process.env.EFI_ENVIRONMENT === 'sandbox',
  };
}

export function validateEfiConfig(): { ok: boolean; issues: string[] } {
  const status = getEfiConfigStatus();
  const issues: string[] = [];
  if (!status.clientId) issues.push('EFI_CLIENT_ID missing');
  if (!status.clientSecret) issues.push('EFI_CLIENT_SECRET missing');
  if (!status.pixKey) issues.push('EFI_PIX_KEY missing');
  if (!status.certificatePath) issues.push('EFI_CERTIFICATE_PATH missing');
  else if (!status.certificateExists)
    issues.push(`EFI certificate not found at ${status.certificatePath}`);
  return { ok: issues.length === 0, issues };
}

const options = {
  client_id: process.env.EFI_CLIENT_ID!,
  client_secret: process.env.EFI_CLIENT_SECRET!,
  sandbox: process.env.EFI_ENVIRONMENT === 'sandbox',
  certificate: resolveCertificatePath(),
  passphrase: process.env.EFI_CERTIFICATE_PASSWORD || '',
};

export const efiClient = new EfiPay(options);

export interface EfiSubscriptionParams {
  customerId: string;
  planId: string;
  amount: number;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
}

export interface EfiSubscriptionResponse {
  id: string;
  status: string;
  payment_url?: string;
  customer_id: string;
  plan_id: string;
}

export class EfiService {
  private client: typeof efiClient;

  constructor() {
    this.client = efiClient;
  }

  async createSubscription(
    params: EfiSubscriptionParams
  ): Promise<EfiSubscriptionResponse> {
    try {
      // EFI API call to create a charge or subscription
      const body = {
        items: [
          {
            name: params.description || 'Subscription',
            amount: 1,
            value: params.amount,
          },
        ],
        payment: {
          banking_billet: {
            expire_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0], // 7 days from now
            customer: {
              name: params.customerName,
              cpf: params.customerCpf,
              email: params.customerEmail,
            },
          },
        },
        notification_url: `${getBaseUrl()}/api/webhooks/efi`,
      };

  const response = await this.client.createOneStepCharge([], body);

      return {
        id: response.data.charge_id.toString(),
        status: response.data.status,
        payment_url: response.data.link || response.data.billet_link,
        customer_id: params.customerId,
        plan_id: params.planId,
      };
    } catch (error) {
      console.error('Error creating EFI subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async retrieveSubscription(subscriptionId: string) {
    try {
      const params = {
        id: parseInt(subscriptionId),
      };
      const response = await this.client.detailCharge(params);
      return response.data;
    } catch (error) {
      console.error('Error retrieving EFI subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      // EFI doesn't have a direct cancel method, this is just for interface compatibility
      console.log('Cancelling subscription:', subscriptionId);
      return {
        id: subscriptionId,
        status: 'cancelled',
      };
    } catch (error) {
      console.error('Error cancelling EFI subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async testConnection() {
    try {
      // Test connection by getting account balance or basic info
      // This is a simple test that doesn't create any charges
      const response = await this.client.getAccountBalance();
      return {
        connected: true,
        environment: process.env.EFI_ENVIRONMENT,
        balance: response.saldo,
        status: 'Active',
        config: getEfiConfigStatus(),
      };
    } catch (error) {
      console.error('EFI connection test error:', error);
      throw new Error(
        `EFI connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // EFI webhook signature verification using HMAC-SHA256

      // Get the webhook secret from environment variables
      const webhookSecret = process.env.EFI_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('EFI_WEBHOOK_SECRET environment variable is not set');
        return false;
      }

      // Create HMAC signature using the payload and webhook secret
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      // Compare the signatures using a constant-time comparison to prevent timing attacks
      const receivedSignature = signature.replace('sha256=', '');

      // Use timingSafeEqual for secure comparison
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      const receivedBuffer = Buffer.from(receivedSignature, 'hex');

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}

export const efiService = new EfiService();
export const efi = efiClient; // Export the raw EfiPay client for direct API access
export default efiService;
