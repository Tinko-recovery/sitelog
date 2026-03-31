import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator'
import { useAuthStore, TenantPlan } from '../../store/authStore'
import { apiFetch } from '../../services/supabase'
import { refreshSession } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PlanSelect'>

interface PlanOption {
  code: TenantPlan
  nameKey: string
  priceKey: string
  periodKey?: string
  featuresKey: string
  popular?: boolean
}

const PLANS: PlanOption[] = [
  {
    code: 'trial',
    nameKey: 'onboarding.plan_trial_name',
    priceKey: 'onboarding.plan_trial_price',
    featuresKey: 'onboarding.plan_trial_features',
  },
  {
    code: 'starter',
    nameKey: 'onboarding.plan_starter_name',
    priceKey: 'onboarding.plan_starter_price',
    periodKey: 'onboarding.plan_starter_period',
    featuresKey: 'onboarding.plan_starter_features',
    popular: true,
  },
  {
    code: 'pro',
    nameKey: 'onboarding.plan_pro_name',
    priceKey: 'onboarding.plan_pro_price',
    periodKey: 'onboarding.plan_pro_period',
    featuresKey: 'onboarding.plan_pro_features',
  },
]

export function PlanSelectScreen({ route }: Props) {
  const { businessName, businessLocation, referralCode, siteName, siteLocation } = route.params
  const { t } = useTranslation()
  const { selectedLanguage, setSelectedPlan, setTenant } = useAuthStore()
  const [selectedCode, setSelectedCode] = useState<TenantPlan>('trial')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGetStarted() {
    setSelectedPlan(selectedCode)
    setLoading(true)
    setError(null)

    try {
      const result = await apiFetch<{
        tenantId: string
        tenantName: string
        role: 'master'
        siteId: string
      }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          tenantName: businessName,
          siteName,
          siteLocation,
          language: selectedLanguage,
          selectedPlan: selectedCode,
          referralCode,
        }),
      })

      // Refresh JWT so the hook injects tenant_id + role into claims
      const refreshed = await refreshSession()
      useAuthStore.getState().setSession(refreshed)
      setTenant(result.tenantId, result.tenantName, result.role)
      // RootNavigator detects tenantId is now set and switches to AppNavigator
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Step indicator */}
        <View style={styles.steps}>
          <View style={[styles.step, styles.stepDone]} />
          <View style={[styles.step, styles.stepDone]} />
          <View style={[styles.step, styles.stepActive]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{t('onboarding.plan_title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.plan_subtitle')}</Text>
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => {
            const selected = selectedCode === plan.code
            const features = t(plan.featuresKey, { returnObjects: true }) as string[]

            return (
              <TouchableOpacity
                key={plan.code}
                onPress={() => setSelectedCode(plan.code)}
                activeOpacity={0.85}
                style={[styles.planCard, selected && styles.planCardSelected]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>{t('onboarding.plan_popular')}</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View>
                    <Text style={[styles.planName, selected && styles.planNameSelected]}>
                      {t(plan.nameKey)}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                        {t(plan.priceKey)}
                      </Text>
                      {plan.periodKey && (
                        <Text style={[styles.planPeriod, selected && styles.planPeriodSelected]}>
                          {t(plan.periodKey)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </View>

                <View style={styles.features}>
                  {features.map((feature, i) => (
                    <Text key={i} style={[styles.feature, selected && styles.featureSelected]}>
                      ✓ {feature}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.paymentNote}>{t('onboarding.payment_note')}</Text>

        <Button
          label={t('onboarding.get_started')}
          onPress={handleGetStarted}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  steps: { flexDirection: 'row', gap: 6, marginBottom: 32 },
  step: { height: 4, flex: 1, borderRadius: 2, backgroundColor: '#E5E7EB' },
  stepDone: { backgroundColor: '#F97316' },
  stepActive: { backgroundColor: '#F97316' },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1C', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  plans: { gap: 12, marginBottom: 16 },
  planCard: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  planCardSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F97316',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  popularText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planName: { fontSize: 16, fontWeight: '700', color: '#1C1C1C', marginBottom: 2 },
  planNameSelected: { color: '#F97316' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  planPrice: { fontSize: 22, fontWeight: '900', color: '#1C1C1C' },
  planPriceSelected: { color: '#F97316' },
  planPeriod: { fontSize: 13, color: '#6B7280' },
  planPeriodSelected: { color: '#F97316', opacity: 0.7 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#F97316' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F97316' },
  features: { gap: 4 },
  feature: { fontSize: 13, color: '#6B7280' },
  featureSelected: { color: '#92400E' },
  error: { fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 12 },
  paymentNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 },
  cta: {},
})
