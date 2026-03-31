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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FirstSite'>

export function FirstSiteScreen({ route, navigation }: Props) {
  const { businessName, businessLocation, referralCode } = route.params
  const { t } = useTranslation()
  const [siteName, setSiteName] = useState('')
  const [siteLocation, setSiteLocation] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleNext() {
    if (!siteName.trim()) {
      setError(t('common.error_generic'))
      return
    }
    setError(null)
    navigation.navigate('PlanSelect', {
      businessName,
      businessLocation,
      referralCode,
      siteName: siteName.trim(),
      siteLocation: siteLocation.trim() || undefined,
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
            <View style={[styles.step, styles.stepDone]} />
            <View style={[styles.step, styles.stepActive]} />
            <View style={styles.step} />
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('onboarding.site_name_title')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.site_name_subtitle')}</Text>
          </View>

          <Input
            label=""
            placeholder={t('onboarding.site_name_placeholder')}
            value={siteName}
            onChangeText={(text) => {
              setSiteName(text)
              setError(null)
            }}
            error={error ?? undefined}
            autoFocus
            maxLength={100}
          />

          <Input
            label={t('onboarding.site_location_label')}
            placeholder={t('onboarding.site_location_placeholder')}
            value={siteLocation}
            onChangeText={setSiteLocation}
            maxLength={150}
          />

          <Button
            label={t('common.next')}
            onPress={handleNext}
            disabled={!siteName.trim()}
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
    marginBottom: 24,
  },
  step: { height: 4, flex: 1, borderRadius: 2, backgroundColor: '#E5E7EB' },
  stepDone: { backgroundColor: '#F97316' },
  stepActive: { backgroundColor: '#F97316' },
  backBtn: { marginBottom: 24 },
  backText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1C', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  cta: { marginTop: 16 },
})
