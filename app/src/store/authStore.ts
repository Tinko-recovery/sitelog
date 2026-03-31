import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { SupportedLanguage } from '../i18n'

export type UserRole = 'viewer' | 'operator' | 'master'
export type TenantPlan = 'trial' | 'starter' | 'pro'

interface AuthState {
  // Auth
  session: Session | null
  isLoadingSession: boolean

  // Tenant (populated after onboarding or from JWT)
  tenantId: string | null
  tenantName: string | null
  role: UserRole | null

  // Onboarding progress (stored locally, not yet in DB)
  selectedLanguage: SupportedLanguage
  selectedPlan: TenantPlan

  // Actions
  setSession: (session: Session | null) => void
  setLoadingSession: (loading: boolean) => void
  setTenant: (tenantId: string, tenantName: string, role: UserRole) => void
  setLanguage: (lang: SupportedLanguage) => void
  setSelectedPlan: (plan: TenantPlan) => void
  reset: () => void
}

const initialState = {
  session: null,
  isLoadingSession: true,
  tenantId: null,
  tenantName: null,
  role: null,
  selectedLanguage: 'en' as SupportedLanguage,
  selectedPlan: 'trial' as TenantPlan,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setSession: (session) => {
    if (!session) {
      set({ session: null, tenantId: null, tenantName: null, role: null })
      return
    }

    // Extract custom claims injected by the JWT hook
    const payload = parseJwtPayload(session.access_token)
    const tenantId = payload.tenant_id as string | undefined
    const role = payload.role as UserRole | undefined

    set({
      session,
      tenantId: tenantId ?? null,
      role: role ?? null,
    })
  },

  setLoadingSession: (isLoadingSession) => set({ isLoadingSession }),

  setTenant: (tenantId, tenantName, role) =>
    set({ tenantId, tenantName, role }),

  setLanguage: (selectedLanguage) => set({ selectedLanguage }),

  setSelectedPlan: (selectedPlan) => set({ selectedPlan }),

  reset: () => set(initialState),
}))

function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return {}
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}
