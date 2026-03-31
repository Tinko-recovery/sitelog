import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LanguageSelectScreen } from '../screens/auth/LanguageSelectScreen'
import { PhoneOTPScreen } from '../screens/auth/PhoneOTPScreen'
import { OTPVerifyScreen } from '../screens/auth/OTPVerifyScreen'

export type AuthStackParamList = {
  LanguageSelect: undefined
  PhoneOTP: undefined
  OTPVerify: { phone: string }
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="LanguageSelect"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="PhoneOTP" component={PhoneOTPScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
    </Stack.Navigator>
  )
}
