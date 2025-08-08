export type PaymentMethod = 'pix' | 'credit' | 'boleto';

export type PaymentPhase = 'identify' | 'method' | 'pay';

export interface PaymentData {
  qrcodeImage: string;
  qrcodeText: string;
  txid: string;
}
