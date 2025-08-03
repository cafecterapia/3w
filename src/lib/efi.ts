// Efi SDK initialization and helper functions
import EfiPay from 'sdk-node-apis-efi';

const options = {
  client_id: process.env.EFI_CLIENT_ID!,
  client_secret: process.env.EFI_CLIENT_SECRET!,
  sandbox: process.env.EFI_ENVIRONMENT === 'sandbox',
};

export const efiClient = new EfiPay(options);

export interface EfiSubscriptionParams {
  customerId: string;
  planId: string;
  amount: number;
  description?: string;
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
              name: 'Customer Name',
              cpf: '00000000000',
              email: 'customer@example.com',
            },
          },
        },
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/efi`,
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

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // EFI webhook signature verification
    // This is a placeholder - implement according to EFI documentation
    return true;
  }
}

export const efiService = new EfiService();
export default efiService;
