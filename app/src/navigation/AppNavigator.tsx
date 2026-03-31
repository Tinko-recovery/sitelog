import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { DashboardScreen } from '../screens/dashboard/DashboardScreen'

export type AppStackParamList = {
  Dashboard: undefined
  // Phase 2+: Entries, Approvals, Budgets, Reports, Settings
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  )
}
