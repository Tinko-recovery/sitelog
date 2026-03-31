import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'
import i18n from '../i18n'

// Bootstraps the auth session from SecureStore and listens for changes.
// Call this once from App.tsx.
export function useAuthBootstrap() {
  const { setSession, setLoadingSession } = useAuthStore()

  useEffect(() => {
    // Load persisted session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingSession(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoadingSession(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])
}

// Sends phone OTP via Supabase Auth
export async function sendPhoneOTP(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    phone: `+91${phone}`,
  })
  if (error) throw error
}

// Verifies OTP — returns session on success
export async function verifyPhoneOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: `+91${phone}`,
    token,
    type: 'sms',
  })
  if (error) throw error
  return data
}

// After onboarding: refresh session so JWT hook injects tenant_id + role
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession()
  if (error) throw error
  return data.session
}

export async function signOut() {
  await supabase.auth.signOut()
  useAuthStore.getState().reset()
}

// Returns true if the current JWT has tenant claims (user has completed onboarding)
export function hasTenantClaims(): boolean {
  const { tenantId, role } = useAuthStore.getState()
  return tenantId !== null && role !== null
}

// Syncs the language preference to i18n
export function useLanguageSync() {
  const { selectedLanguage } = useAuthStore()
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage])
}
