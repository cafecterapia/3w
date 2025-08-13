export type PaymentMethod = 'pix' | 'credit' | 'boleto';

export type PaymentPhase = 'identify' | 'method' | 'pay';

export type PixPaymentData = {
  kind: 'pix';
  qrcodeImage: string;
  qrcodeText: string;
  txid: string; // externalId for pix
};

export type CardPaymentData = {
  kind: 'card';
  chargeId: string; // externalId (numeric) as string
  paymentUrl?: string;
  cardBrand?: string;
  cardLast4?: string;
};

export type BoletoPaymentData = {
  kind: 'boleto';
  chargeId: string; // externalId (numeric) as string
  billetLink?: string;
  billetPdfUrl?: string;
  barcode?: string;
};

export type PaymentData = PixPaymentData | CardPaymentData | BoletoPaymentData;
