import './src/i18n'  // Initialize i18n before anything renders
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useAuthBootstrap, useLanguageSync } from './src/hooks/useAuth'
import { RootNavigator } from './src/navigation/RootNavigator'

function AppInner() {
  useAuthBootstrap()    // Loads persisted session + listens for auth changes
  useLanguageSync()     // Keeps i18n in sync with selected language in store
  return <RootNavigator />
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppInner />
    </NavigationContainer>
  )
}
