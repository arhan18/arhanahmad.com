import DodoPayments from 'dodopayments';

const dodo = new DodoPayments({
  bearerToken: import.meta.env.DODO_PAYMENTS_API_KEY || '',
  environment: import.meta.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode' || 'test_mode',
});

export default dodo;

export const DODO_CONFIG = {
  environment: import.meta.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode',
  returnUrl: import.meta.env.DODO_PAYMENTS_RETURN_URL || 'https://arhanahmad.com/checkout/success',
  webhookSecret: import.meta.env.DODO_PAYMENTS_WEBHOOK_KEY || '',
} as const;
