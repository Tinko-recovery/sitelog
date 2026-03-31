import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set')
if (!supabaseAnonKey) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set')

// Supabase needs a storage adapter for React Native.
// expo-secure-store encrypts tokens at rest.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? ''

// Helper: authenticated fetch to the Next.js backend
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}
