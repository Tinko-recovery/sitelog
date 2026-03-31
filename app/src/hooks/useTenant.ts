import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'

export interface Site {
  id: string
  name: string
  location: string | null
  is_active: boolean
}

export interface TenantSummary {
  id: string
  name: string
  plan: string
  subscription_status: string | null
  trial_ends_at: string | null
}

// Fetches the tenant record and sites for the current user.
// Only use after onboarding is complete (tenantId is set).
export function useTenant() {
  const { tenantId, tenantName, setTenant, role } = useAuthStore()
  const [tenant, setTenantData] = useState<TenantSummary | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false)
      return
    }

    async function load() {
      try {
        setIsLoading(true)
        setError(null)

        const [tenantResult, sitesResult] = await Promise.all([
          supabase
            .from('tenants')
            .select('id, name, plan, subscription_status, trial_ends_at')
            .eq('id', tenantId)
            .single(),
          supabase
            .from('sites')
            .select('id, name, location, is_active')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .order('created_at', { ascending: true }),
        ])

        if (tenantResult.error) throw tenantResult.error
        if (sitesResult.error) throw sitesResult.error

        setTenantData(tenantResult.data)
        setSites(sitesResult.data ?? [])

        if (tenantResult.data && role) {
          setTenant(tenantResult.data.id, tenantResult.data.name, role)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tenant data')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [tenantId])

  // Days remaining in trial
  const trialDaysRemaining = (() => {
    if (!tenant?.trial_ends_at) return null
    const diff = new Date(tenant.trial_ends_at).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()

  const isReadOnly = tenant?.subscription_status === 'read_only'
  const isTrialExpired =
    tenant?.plan === 'trial' &&
    trialDaysRemaining !== null &&
    trialDaysRemaining <= 0

  return {
    tenant,
    sites,
    isLoading,
    error,
    trialDaysRemaining,
    isReadOnly,
    isTrialExpired,
  }
}
