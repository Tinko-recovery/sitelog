// Resend email integration — wired in Phase 4
// Stub exists so imports don't break during development

const apiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'sitelog@yourdomain.com'

if (process.env.NODE_ENV === 'production' && !apiKey) {
  throw new Error('RESEND_API_KEY must be set in production')
}

export const resendConfig = {
  apiKey: apiKey ?? '',
  fromEmail,
}
