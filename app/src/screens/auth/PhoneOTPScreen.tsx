import React, { useState } from 'react'
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
import { sendPhoneOTP } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneOTP'>

export function PhoneOTPScreen({ navigation }: Props) {
  const { t } = useTranslation()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError(t('auth.error_invalid_phone'))
      return false
    }
    setError(null)
    return true
  }

  async function handleSendOTP() {
    if (!validate()) return

    setLoading(true)
    try {
      await sendPhoneOTP(phone.replace(/\D/g, ''))
      navigation.navigate('OTPVerify', { phone: phone.replace(/\D/g, '') })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error_generic'))
    } finally {
      setLoading(false)
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
            <Text style={styles.title}>{t('auth.phone_title')}</Text>
            <Text style={styles.subtitle}>{t('auth.phone_subtitle')}</Text>
          </View>

          <Input
            label=""
            placeholder={t('auth.phone_placeholder')}
            prefix={t('auth.phone_prefix')}
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/\D/g, '').slice(0, 10))
              setError(null)
            }}
            error={error ?? undefined}
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
          />

          <Button
            label={t('auth.send_otp')}
            onPress={handleSendOTP}
            loading={loading}
            disabled={phone.replace(/\D/g, '').length !== 10}
            fullWidth
            size="lg"
          />
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
  backBtn: {
    marginBottom: 32,
  },
  backText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
})
