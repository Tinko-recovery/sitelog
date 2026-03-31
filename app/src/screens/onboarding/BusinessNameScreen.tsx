import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BusinessName'>

export function BusinessNameScreen({ navigation }: Props) {
  const { t } = useTranslation()
  const [businessName, setBusinessName] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [showReferral, setShowReferral] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNext() {
    if (!businessName.trim()) {
      setError(t('common.error_generic'))
      return
    }
    setError(null)
    navigation.navigate('FirstSite', {
      businessName: businessName.trim(),
      businessLocation: businessLocation.trim() || undefined,
      referralCode: referralCode.trim().toUpperCase() || undefined,
    })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step indicator */}
          <View style={styles.steps}>
            <View style={[styles.step, styles.stepActive]} />
            <View style={styles.step} />
            <View style={styles.step} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{t('onboarding.business_name_title')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.business_name_subtitle')}</Text>
          </View>

          <Input
            label=""
            placeholder={t('onboarding.business_name_placeholder')}
            value={businessName}
            onChangeText={(text) => {
              setBusinessName(text)
              setError(null)
            }}
            error={error ?? undefined}
            autoFocus
            maxLength={80}
          />

          <Input
            label={t('onboarding.business_location_label')}
            placeholder={t('onboarding.business_location_placeholder')}
            value={businessLocation}
            onChangeText={setBusinessLocation}
            maxLength={120}
          />

          {/* Referral code toggle */}
          {!showReferral ? (
            <TouchableOpacity
              onPress={() => setShowReferral(true)}
              style={styles.referralToggle}
            >
              <Text style={styles.referralToggleText}>
                + {t('onboarding.referral_label')}
              </Text>
            </TouchableOpacity>
          ) : (
            <Input
              label={t('onboarding.referral_label')}
              placeholder={t('onboarding.referral_placeholder')}
              value={referralCode}
              onChangeText={(text) => setReferralCode(text.toUpperCase())}
              maxLength={10}
              autoCapitalize="characters"
            />
          )}

          <Button
            label={t('common.next')}
            onPress={handleNext}
            disabled={!businessName.trim()}
            fullWidth
            size="lg"
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 40,
  },
  step: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  stepActive: {
    backgroundColor: '#F97316',
  },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1C', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  referralToggle: { marginBottom: 16 },
  referralToggleText: { fontSize: 14, color: '#F97316', fontWeight: '600' },
  cta: { marginTop: 16 },
})
