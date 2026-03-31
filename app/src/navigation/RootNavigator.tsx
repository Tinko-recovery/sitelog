import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { AuthNavigator } from './AuthNavigator'
import { OnboardingNavigator } from './OnboardingNavigator'
import { AppNavigator } from './AppNavigator'

// Decides which navigator to show based on auth + onboarding state.
// ┌────────────────────────────────────────────────────────────┐
// │ No session            → AuthNavigator (OTP login)          │
// │ Session + no tenant   → OnboardingNavigator                │
// │ Session + tenant      → AppNavigator (dashboard)           │
// └────────────────────────────────────────────────────────────┘
export function RootNavigator() {
  const { session, isLoadingSession, tenantId } = useAuthStore()

  if (isLoadingSession) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    )
  }

  if (!session) {
    return <AuthNavigator />
  }

  if (!tenantId) {
    // User is authenticated but hasn't completed onboarding yet
    return <OnboardingNavigator />
  }

  return <AppNavigator />
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
})
