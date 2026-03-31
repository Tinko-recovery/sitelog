import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin, Language, TenantPlan } from '../../../lib/supabaseAdmin'

interface SignupBody {
  tenantName: string
  siteName: string
  siteLocation?: string
  language: Language
  selectedPlan: TenantPlan
  referralCode?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueSlug(base: string): Promise<string> {
  const slug = slugify(base)
  const { data } = await supabaseAdmin
    .from('tenants')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (!data) return slug
  // Slug taken — append 4-char random suffix
  return `${slug}-${Math.random().toString(36).substring(2, 6)}`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // ── Authenticate the caller ──────────────────────────────────────────────
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' })
    return
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  // ── Validate body ────────────────────────────────────────────────────────
  const { tenantName, siteName, siteLocation, language, selectedPlan, referralCode } =
    req.body as SignupBody

  if (!tenantName?.trim()) {
    res.status(400).json({ error: 'tenantName is required' })
    return
  }
  if (!siteName?.trim()) {
    res.status(400).json({ error: 'siteName is required' })
    return
  }
  if (!['en', 'hi', 'kn'].includes(language)) {
    res.status(400).json({ error: 'language must be en, hi, or kn' })
    return
  }
  if (!['trial', 'starter', 'pro'].includes(selectedPlan)) {
    res.status(400).json({ error: 'selectedPlan must be trial, starter, or pro' })
    return
  }

  // ── Check user doesn't already have a tenant ─────────────────────────────
  const { data: existingUser } = await supabaseAdmin
    .from('tenant_users')
    .select('id, tenant_id')
    .eq('user_id', user.id)
    .single()

  if (existingUser) {
    res.status(409).json({
      error: 'Account already set up',
      tenantId: existingUser.tenant_id,
    })
    return
  }

  // ── Validate referral code if provided ───────────────────────────────────
  const normalizedReferralCode = referralCode?.toUpperCase().trim() ?? null

  if (normalizedReferralCode) {
    const { data: partner } = await supabaseAdmin
      .from('partners')
      .select('id')
      .eq('referral_code', normalizedReferralCode)
      .eq('is_active', true)
      .single()

    if (!partner) {
      res.status(400).json({ error: 'Referral code not found or inactive' })
      return
    }
  }

  // ── Step 1: Create tenant ────────────────────────────────────────────────
  const slug = await generateUniqueSlug(tenantName)

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: tenantName.trim(),
      slug,
      plan: selectedPlan,
      subscription_status: 'trial',
      referred_by_code: normalizedReferralCode,
    })
    .select()
    .single()

  if (tenantError || !tenant) {
    console.error('[signup] tenant creation failed:', tenantError)
    res.status(500).json({ error: 'Failed to create account. Please try again.' })
    return
  }

  // ── Step 2: Create tenant_user with master role ──────────────────────────
  const { error: userError } = await supabaseAdmin
    .from('tenant_users')
    .insert({
      tenant_id: tenant.id,
      user_id: user.id,
      role: 'master',
      language,
      phone: user.phone ?? null,
    })

  if (userError) {
    // Rollback: delete the tenant we just created
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)
    console.error('[signup] tenant_user creation failed:', userError)
    res.status(500).json({ error: 'Failed to create user record. Please try again.' })
    return
  }

  // ── Step 3: Create first site ────────────────────────────────────────────
  const { data: site, error: siteError } = await supabaseAdmin
    .from('sites')
    .insert({
      tenant_id: tenant.id,
      name: siteName.trim(),
      location: siteLocation?.trim() ?? null,
      is_active: true,
    })
    .select()
    .single()

  if (siteError || !site) {
    // Rollback both tenant and user
    await supabaseAdmin.from('tenant_users').delete().eq('tenant_id', tenant.id)
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)
    console.error('[signup] site creation failed:', siteError)
    res.status(500).json({ error: 'Failed to create site. Please try again.' })
    return
  }

  // ── Success ──────────────────────────────────────────────────────────────
  // The JWT hook will inject tenant_id + role into the JWT on next session refresh.
  // The client must call supabase.auth.refreshSession() after this returns.
  res.status(201).json({
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    role: 'master' as const,
    siteId: site.id,
    siteName: site.name,
  })
}
