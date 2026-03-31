import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { AuthStackParamList } from '../../navigation/AuthNavigator'
import { verifyPhoneOTP, sendPhoneOTP, refreshSession } from '../../hooks/useAuth'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>

const RESEND_COOLDOWN_SECONDS = 30

export function OTPVerifyScreen({ route, navigation }: Props) {
  const { phone } = route.params
  const { t } = useTranslation()
  const { setSession } = useAuthStore()

  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS)
  const [resending, setResending] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start countdown on mount
  useEffect(() => {
    startCountdown()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function startCountdown() {
    setResendCountdown(RESEND_COOLDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleVerify() {
    const trimmed = otp.trim()
    if (trimmed.length !== 6) {
      setError(t('auth.error_invalid_otp'))
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { session } = await verifyPhoneOTP(phone, trimmed)

      if (!session) {
        setError(t('auth.error_otp_wrong'))
        return
      }

      // Refresh to pick up any existing JWT claims (returning user)
      const refreshed = await refreshSession()
      setSession(refreshed)
      // RootNavigator will re-render automatically via auth store
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error_generic')
      if (message.toLowerCase().includes('expired')) {
        setError(t('auth.error_otp_expired'))
      } else {
        setError(t('auth.error_otp_wrong'))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCountdown > 0 || resending) return
    setResending(true)
    setError(null)
    try {
      await sendPhoneOTP(phone)
      setOtp('')
      startCountdown()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error_generic'))
    } finally {
      setResending(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.otp_title')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.otp_subtitle')}{' '}
              <Text style={styles.phone}>+91 {phone}</Text>
            </Text>
          </View>

          <Input
            label=""
            placeholder={t('auth.otp_placeholder')}
            value={otp}
            onChangeText={(text) => {
              setOtp(text.replace(/\D/g, '').slice(0, 6))
              setError(null)
            }}
            error={error ?? undefined}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <Button
            label={t('auth.verify_otp')}
            onPress={handleVerify}
            loading={loading}
            disabled={otp.trim().length !== 6}
            fullWidth
            size="lg"
            style={styles.verifyBtn}
          />

          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCountdown > 0 || resending}
            style={styles.resendRow}
          >
            <Text style={[styles.resendText, resendCountdown > 0 && styles.resendDisabled]}>
              {resendCountdown > 0
                ? t('auth.resend_in', { seconds: resendCountdown })
                : t('auth.resend_otp')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: { marginBottom: 32 },
  backText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1C', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  phone: { fontWeight: '700', color: '#1C1C1C' },
  verifyBtn: { marginBottom: 16 },
  resendRow: { alignItems: 'center', paddingVertical: 8 },
  resendText: { fontSize: 14, color: '#F97316', fontWeight: '600' },
  resendDisabled: { color: '#9CA3AF' },
})
