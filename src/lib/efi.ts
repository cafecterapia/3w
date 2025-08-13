// Efi SDK initialization and helper functions
import EfiPay from 'sdk-node-apis-efi';
import { getBaseUrl } from './utils';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';

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
  // Dev fallback: try to read a bundled base64 certificate if present
  try {
    const guessDevB64 = path.resolve(process.cwd(), 'certs');
    if (fs.existsSync(guessDevB64)) {
      const files = fs
        .readdirSync(guessDevB64)
        .filter((f) => f.endsWith('.p12.b64'));
      if (files.length > 0) {
        const b64Path = path.join(guessDevB64, files[0]);
        const raw = fs.readFileSync(b64Path, 'utf8').trim();
        const buffer = Buffer.from(raw.replace(/\s+/g, ''), 'base64');
        if (buffer.length > 16) {
          console.warn('[EFI] Using development certificate from', b64Path);
          return { value: raw.replace(/\s+/g, ''), isBase64: true };
        }
      }
    }
  } catch (err) {
    // ignore
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
  const certExists =
    certPath === 'from-base64-env'
      ? true
      : certPath
        ? fs.existsSync(certPath)
        : false;
  return {
    clientId: !!process.env.EFI_CLIENT_ID,
    clientSecret: !!process.env.EFI_CLIENT_SECRET,
    pixKey: !!process.env.EFI_PIX_KEY,
    webhookSecret: !!process.env.EFI_WEBHOOK_SECRET,
    payeeCode: !!process.env.EFI_PAYEE_CODE,
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

// Lighter validator for non-PIX (card/boleto) flows that do not strictly require certificate
export function validateEfiCoreConfig(): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!process.env.EFI_CLIENT_ID) issues.push('EFI_CLIENT_ID missing');
  if (!process.env.EFI_CLIENT_SECRET) issues.push('EFI_CLIENT_SECRET missing');
  if (!process.env.EFI_PAYEE_CODE)
    issues.push('EFI_PAYEE_CODE missing (required for non-PIX endpoints)');
  // Environment sanity
  const env = process.env.EFI_ENVIRONMENT;
  if (!env)
    issues.push('EFI_ENVIRONMENT missing (use "sandbox" or "production")');
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
// The SDK expects the certificate as a file path string. For serverless, we materialize a temp file if base64 is provided.
const options: {
  client_id: string;
  client_secret: string;
  sandbox: boolean;
  certificate?: string;
  passphrase?: string;
  partner_token?: string; // not used: setting this can enable partner mode and break regular accounts
} = {
  client_id: process.env.EFI_CLIENT_ID!,
  client_secret: process.env.EFI_CLIENT_SECRET!,
  sandbox: process.env.EFI_ENVIRONMENT === 'sandbox',
};
// Only include passphrase if non-empty; some libraries mis-handle empty strings.
if (passphrase) options.passphrase = passphrase;
// Do NOT set partner_token at initialization. It can switch the SDK into a partner mode
// that conflicts with regular account usage. For non-PIX endpoints, we'll pass
// 'x-efipay-account-id' per request instead.

// If base64 cert is provided, write to a temporary file and pass the path to the SDK.
if (certificateValue) {
  if (isBase64) {
    try {
      const tmpDir = os.tmpdir();
      const tmpPath = path.join(tmpDir, `efi-cert-${process.pid}.p12`);
      if (!fs.existsSync(tmpPath)) {
        fs.writeFileSync(tmpPath, Buffer.from(certificateValue, 'base64'));
        console.log('[EFI] Certificate written to temp file:', tmpPath);
      }
      options.certificate = tmpPath;
      console.log('[EFI] Using certificate from temp file:', tmpPath);
      // Note: do NOT set cert_base64. Some SDK versions only accept a filesystem path.
    } catch (err) {
      console.error('[EFI] Failed to write temp certificate file:', err);
      // Fallback: try passing the base64 directly; may work if SDK supports it.
      options.certificate = certificateValue;
    }
  } else {
    options.certificate = certificateValue; // resolved path
    console.log('[EFI] Using certificate from path:', certificateValue);
  }
} else {
  console.warn(
    '[EFI] No certificate available - this may cause issues with API calls'
  );
}

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

  // For non-PIX endpoints, provide the Efí account identifier header per request.
  // Avoid partner_token on the client to keep regular account behavior.
  private getPayeeRequestOptions(): any {
    const payeeCode = process.env.EFI_PAYEE_CODE?.trim();
    if (!payeeCode) return {};
    return { headers: { 'x-efipay-account-id': payeeCode } };
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

      const apiParams = this.getPayeeRequestOptions();
      const response = await this.client.createOneStepCharge(apiParams, body);

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

  // Hosted checkout/card charge (no raw card data handled here)
  async createHostedCardCharge(params: {
    description: string;
    amountCents: number;
    customer: { name: string; email: string; cpf: string };
    notificationUrl: string;
  }) {
    try {
      // For hosted checkout, the recommended flow is to create a One Step Link
      // so card data is collected by Efí. This returns a payment_url.
      const body: any = {
        items: [
          { name: params.description, amount: 1, value: params.amountCents },
        ],
        // Optional customer email helps prefill
        customer: { email: params.customer.email },
        metadata: { notification_url: params.notificationUrl },
        settings: {
          payment_method: 'credit_card',
          // Keep link short-lived; adjust as needed
          expire_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          request_delivery_address: false,
        },
      };
      console.log(
        '[EFI] Creating card one-step link with body:',
        JSON.stringify(body, null, 2)
      );
      const apiParams = this.getPayeeRequestOptions();
      const response = await (this.client as any).createOneStepLink?.(
        apiParams,
        body
      );
      console.log('[EFI] Card one-step link response:', response);
      return response.data; // expects charge_id, status, payment_url
    } catch (error) {
      console.error('[EFI] Card charge creation error:', error);
      console.error('[EFI] Error details:', {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      });
      throw error;
    }
  }

  async createBoletoCharge(params: {
    description: string;
    amountCents: number;
    customer: { name: string; email: string; cpf: string };
    expireAtISODate: string;
    notificationUrl: string;
  }) {
    try {
      // Ensure Efí account identifier is available for the required header
      if (
        !process.env.EFI_PAYEE_CODE ||
        process.env.EFI_PAYEE_CODE.trim() === ''
      ) {
        throw new Error(
          'EFI_PAYEE_CODE is required for Boleto charges and must be sent via x-efipay-account-id header.'
        );
      }

      const requestBody = {
        items: [
          { name: params.description, amount: 1, value: params.amountCents },
        ],
        payment: {
          banking_billet: {
            expire_at: params.expireAtISODate,
            customer: params.customer,
          },
        },
        metadata: { notification_url: params.notificationUrl },
      };

      const apiParams = this.getPayeeRequestOptions();
      const response = await (this.client as any).createOneStepCharge(
        apiParams,
        requestBody
      );

      return response.data;
    } catch (error) {
      const err: any = error;
      const status = err?.response?.status;
      const data = err?.response?.data;
      const headers = err?.response?.headers || {};

      const summary = {
        httpStatus: status ?? null,
        efipayRequestId:
          headers['x-efipay-request-id'] || headers['x-request-id'] || null,
        code: data?.code || err?.code || null,
        nome: data?.nome || null,
        mensagem: data?.mensagem || null,
        error: data?.erro || data?.error || null,
        error_description: data?.error_description || null,
      };
      console.error('[EFI] Boleto charge failed. Summary:', summary);
      try {
        const pretty =
          typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        console.error('[EFI] Raw API response body:', pretty);
      } catch {
        console.error('[EFI] Raw API response body: <unserializable payload>');
      }
      if (!data && err?.message) {
        console.error('[EFI] SDK error message:', err.message);
      }

      const configStatus = getEfiConfigStatus();
      console.error('[EFI] Current config status:', configStatus);

      throw error;
    }
  }

  // Transparent card charge using client-side generated payment_token
  async createTransparentCardCharge(params: {
    description: string;
    amountCents: number;
    customer: {
      name: string;
      email: string;
      cpf: string;
      phone_number?: string;
    };
    paymentToken: string;
    installments?: number;
    billingAddress?: {
      street?: string;
      number?: string;
      neighborhood?: string;
      zipcode?: string;
      city?: string;
      state?: string; // 2-letter UF
    };
    notificationUrl: string;
  }) {
    try {
      // Provide account identifier per request for credit card charges
      const apiParams = this.getPayeeRequestOptions();
      if (!('headers' in apiParams)) {
        console.warn(
          '[EFI] EFI_PAYEE_CODE is not set; non-PIX requests may be rejected as Unauthorized.'
        );
      }

      const creditCard: any = {
        installments: Math.max(1, params.installments || 1),
        payment_token: params.paymentToken,
        customer: {
          name: params.customer.name,
          email: params.customer.email,
          cpf: params.customer.cpf,
          ...(params.customer.phone_number
            ? { phone_number: params.customer.phone_number }
            : {}),
        },
      };
      if (params.billingAddress) {
        creditCard.billing_address = params.billingAddress;
      }

      const body: any = {
        items: [
          { name: params.description, amount: 1, value: params.amountCents },
        ],
        payment: {
          credit_card: creditCard,
        },
        metadata: { notification_url: params.notificationUrl },
      };

      const response = await (this.client as any).createOneStepCharge(
        apiParams,
        body
      );
      return response.data; // expects charge_id, status, link/payment_url possibly undefined
    } catch (error) {
      const err: any = error;
      const status = err?.response?.status;
      const data = err?.response?.data;
      const headers = err?.response?.headers || {};

      // Professional, detailed diagnostics to surface the real API error
      const summary = {
        httpStatus: status ?? null,
        efipayRequestId:
          headers['x-efipay-request-id'] || headers['x-request-id'] || null,
        code: err?.code || null,
        nome: data?.nome || null,
        mensagem: data?.mensagem || null,
        error: data?.erro || data?.error || null,
        error_description: data?.error_description || null,
      };
      console.error('[EFI] Transparent card charge failed. Summary:', summary);
      try {
        const pretty =
          typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        console.error('[EFI] Raw API response body:', pretty);
      } catch {
        console.error('[EFI] Raw API response body: <unserializable payload>');
      }
      if (!data && err?.message) {
        console.error('[EFI] SDK error message:', err.message);
      }
      throw error;
    }
  }

  async detailGenericCharge(chargeId: string | number) {
    const params = {
      id: typeof chargeId === 'string' ? parseInt(chargeId) : chargeId,
    } as any;
    // Non-PIX charge detail may require account header
    const requestOptions = this.getPayeeRequestOptions();
    const response = await (this.client as any).detailCharge(
      params,
      undefined,
      requestOptions
    );
    return response.data;
  }

  async cancelGenericCharge(chargeId: string | number) {
    // EFI may not support cancel at all states; attempt and swallow errors
    try {
      const params = {
        id: typeof chargeId === 'string' ? parseInt(chargeId) : chargeId,
      } as any;
      const requestOptions = this.getPayeeRequestOptions();
      const response = await (this.client as any).cancelCharge?.(
        params,
        undefined,
        requestOptions
      );
      return response?.data ?? { status: 'cancel_request_sent' };
    } catch (err) {
      console.warn('EFI cancel charge failed or unsupported:', err);
      return { status: 'cancel_failed' };
    }
  }

  async retrieveSubscription(subscriptionId: string) {
    try {
      const params = {
        id: parseInt(subscriptionId),
      };
      const requestOptions = this.getPayeeRequestOptions();
      const response = await (this.client as any).detailCharge(
        params,
        undefined,
        requestOptions
      );
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
      // Prefer a lightweight PIX operation if certificate is present; otherwise attempt a generic endpoint
      const response = (this.client as any).pixListCharges
        ? await (this.client as any).pixListCharges({
            inicio: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            fim: new Date().toISOString(),
            paginaAtual: 0,
          })
        : await (this.client as any).balance?.();
      return {
        connected: true,
        environment: process.env.EFI_ENVIRONMENT,
        balance: (response as any)?.saldo ?? null,
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
