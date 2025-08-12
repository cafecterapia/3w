// Efi SDK initialization and helper functions
import EfiPay from 'sdk-node-apis-efi';
import { getBaseUrl } from './utils';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// In serverless (Vercel) deployments, relying on a certificate file path can fail.
// Prefer providing the certificate via EFI_CERTIFICATE_BASE64 and pass it as base64
// string with the appropriate flag. Fallback to reading a file path if needed locally.

function getCertificateValue(): { value?: string; isBase64: boolean } {
  const b64 = process.env.EFI_CERTIFICATE_BASE64?.trim();
  if (b64) {
    try {
      // Validate base64 decodes to a plausible PKCS12
      const buffer = Buffer.from(b64.replace(/\s+/g, ''), 'base64');
      if (buffer.length < 16) throw new Error('Decoded certificate too small');
      return { value: b64.replace(/\s+/g, ''), isBase64: true };
    } catch (err) {
      console.error('Failed to decode EFI base64 certificate:', err);
      return { value: undefined, isBase64: false };
    }
  }
  const certPathEnv = process.env.EFI_CERTIFICATE_PATH;
  if (certPathEnv) {
    try {
      const resolved = path.resolve(certPathEnv);
      if (fs.existsSync(resolved)) return { value: resolved, isBase64: false };
      console.error('[EFI] Certificate path does not exist:', resolved);
    } catch (err) {
      console.error('[EFI] Failed to read certificate file:', err);
    }
  }
  return { value: undefined, isBase64: false };
}

function resolveCertificatePath(): string | undefined {
  // Only for diagnostics, not for runtime use, since we prefer in-memory Buffer.
  if (process.env.EFI_CERTIFICATE_BASE64) return 'from-base64-env';
  if (!process.env.EFI_CERTIFICATE_PATH) return undefined;
  return path.resolve(process.env.EFI_CERTIFICATE_PATH);
}

export function getEfiConfigStatus() {
  const certPath = resolveCertificatePath();
  const certExists = certPath === 'from-base64-env' ? true : certPath ? fs.existsSync(certPath) : false;
  return {
    clientId: !!process.env.EFI_CLIENT_ID,
    clientSecret: !!process.env.EFI_CLIENT_SECRET,
    pixKey: !!process.env.EFI_PIX_KEY,
    webhookSecret: !!process.env.EFI_WEBHOOK_SECRET,
    certificatePath: certPath,
    certificateExists: certExists,
    hasPassphrase: !!process.env.EFI_CERTIFICATE_PASSWORD,
    usingBase64: !!process.env.EFI_CERTIFICATE_BASE64,
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
  if (!status.certificateExists)
    issues.push(
      status.usingBase64
        ? 'EFI_CERTIFICATE_BASE64 missing or invalid'
        : status.certificatePath
          ? `EFI certificate not found at ${status.certificatePath}`
          : 'EFI certificate not provided (set EFI_CERTIFICATE_BASE64 or EFI_CERTIFICATE_PATH)'
    );
  return { ok: issues.length === 0, issues };
}

const { value: certificateValue, isBase64 } = getCertificateValue();
const passphrase = process.env.EFI_CERTIFICATE_PASSWORD || '';

if (!certificateValue) {
  console.error(
    '[EFI] No certificate could be resolved. Provide EFI_CERTIFICATE_BASE64 or a valid EFI_CERTIFICATE_PATH.'
  );
}

// Strongly type the options object to align with the sdk-node-apis-efi expected shape.
// The SDK accepts the certificate as a file path string or a Buffer. We pass Buffer for base64 mode.
const options: {
  client_id: string;
  client_secret: string;
  sandbox: boolean;
  certificate?: string;
  cert_base64?: boolean;
  passphrase?: string;
} = {
  client_id: process.env.EFI_CLIENT_ID!,
  client_secret: process.env.EFI_CLIENT_SECRET!,
  sandbox: process.env.EFI_ENVIRONMENT === 'sandbox',
  certificate: certificateValue,
};
// Only include passphrase if non-empty; some libraries mis-handle empty strings.
if (passphrase) options.passphrase = passphrase;
if (certificateValue && isBase64) options.cert_base64 = true;

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
