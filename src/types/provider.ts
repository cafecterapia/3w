export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  slug: string;
  providerId: string;
  provider?: Provider;
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: Date;
  efiSubscriptionId: string | null;
  userId: string;
  providerId: string;
  serviceId: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  provider?: Provider;
  service?: Service;
}

export interface CreateServiceData {
  name: string;
  description: string | null;
  price: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  slug?: string;
}
