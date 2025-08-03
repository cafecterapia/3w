// Global TypeScript types for the subscription app

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxApiCalls: number;
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  plan?: SubscriptionPlan;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  downloadUrl?: string;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ApiUsage {
  id: string;
  userId: string;
  subscriptionId: string;
  date: Date;
  apiCalls: number;
  endpoint?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  billingAlerts: boolean;
  usageAlerts: boolean;
  marketingEmails: boolean;
}

export interface UserSettings {
  userId: string;
  notifications: NotificationPreferences;
  timezone?: string;
  language?: string;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileUpdateForm {
  name: string;
  email: string;
  phone?: string;
}

// Webhook event types
export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  createdAt: Date;
}

export interface EfiWebhookEvent extends WebhookEvent {
  type:
    | 'payment.succeeded'
    | 'payment.failed'
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.cancelled';
  data: {
    subscription_id: string;
    customer_id: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
}
