import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from './lib/supabaseAdmin'

export type AuthenticatedRequest = NextApiRequest & {
  tenantId: string
  userId: string
  role: UserRole
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  operator: 1,
  master: 2,
}

function parseJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Malformed JWT')
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  requiredRole: UserRole = 'viewer'
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization header' })
      return
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token is valid (not forged, not expired)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    // Extract custom claims injected by the JWT hook
    let payload: Record<string, unknown>
    try {
      payload = parseJwtPayload(token)
    } catch {
      res.status(401).json({ error: 'Malformed token' })
      return
    }

    const tenantId = payload.tenant_id as string | undefined
    const role = payload.role as UserRole | undefined

    if (!tenantId || !role) {
      res.status(403).json({ error: 'Account setup incomplete. Complete onboarding first.' })
      return
    }

    if (!(role in ROLE_HIERARCHY)) {
      res.status(403).json({ error: 'Invalid role' })
      return
    }

    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
      res.status(403).json({
        error: `This action requires '${requiredRole}' role. Your role is '${role}'.`,
      })
      return
    }

    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.tenantId = tenantId
    authenticatedReq.userId = user.id
    authenticatedReq.role = role

    return handler(authenticatedReq, res)
  }
}

// Super admin guard — checks super_admins table via service role
export function withSuperAdmin(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
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
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminClient = createAdminClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: superAdmin } = await adminClient
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!superAdmin) {
      res.status(403).json({ error: 'Super admin access required' })
      return
    }

    return handler(req, res)
  }
}
