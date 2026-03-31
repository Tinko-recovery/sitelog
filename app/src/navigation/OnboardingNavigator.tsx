import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BusinessNameScreen } from '../screens/onboarding/BusinessNameScreen'
import { FirstSiteScreen } from '../screens/onboarding/FirstSiteScreen'
import { PlanSelectScreen } from '../screens/onboarding/PlanSelectScreen'

export type OnboardingStackParamList = {
  BusinessName: undefined
  FirstSite: { businessName: string; businessLocation?: string; referralCode?: string }
  PlanSelect: { businessName: string; businessLocation?: string; referralCode?: string; siteName: string; siteLocation?: string }
}

const Stack = createNativeStackNavigator<OnboardingStackParamList>()

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="BusinessName"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="BusinessName" component={BusinessNameScreen} />
      <Stack.Screen name="FirstSite" component={FirstSiteScreen} />
      <Stack.Screen name="PlanSelect" component={PlanSelectScreen} />
    </Stack.Navigator>
  )
}
