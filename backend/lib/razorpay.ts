// Razorpay integration — wired in Phase 5
// Stub exists so imports don't break during development

const keyId = process.env.RAZORPAY_KEY_ID
const keySecret = process.env.RAZORPAY_KEY_SECRET

if (process.env.NODE_ENV === 'production' && (!keyId || !keySecret)) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in production')
}

export const razorpayConfig = {
  keyId: keyId ?? '',
  keySecret: keySecret ?? '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
}
