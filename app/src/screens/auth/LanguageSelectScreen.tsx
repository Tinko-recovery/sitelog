import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { AuthStackParamList } from '../../navigation/AuthNavigator'
import { useAuthStore } from '../../store/authStore'
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n'
import i18n from '../../i18n'
import { Button } from '../../components/ui/Button'

type Props = NativeStackScreenProps<AuthStackParamList, 'LanguageSelect'>

const LANGUAGE_OPTIONS: { code: SupportedLanguage; nativeName: string; englishName: string }[] = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada' },
]

export function LanguageSelectScreen({ navigation }: Props) {
  const { t } = useTranslation()
  const { selectedLanguage, setLanguage } = useAuthStore()

  function selectLanguage(lang: SupportedLanguage) {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  function handleContinue() {
    navigation.navigate('PhoneOTP')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SL</Text>
          </View>
          <Text style={styles.appName}>SiteLog</Text>
          <Text style={styles.tagline}>by Blocks and Loops</Text>
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('language.select_title')}</Text>
          <Text style={styles.subtitle}>{t('language.select_subtitle')}</Text>
        </View>

        {/* Language options */}
        <View style={styles.options}>
          {LANGUAGE_OPTIONS.map((lang) => {
            const selected = selectedLanguage === lang.code
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => selectLanguage(lang.code)}
                activeOpacity={0.8}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={[styles.optionNative, selected && styles.optionNativeSelected]}>
                  {lang.nativeName}
                </Text>
                {lang.code !== 'en' && (
                  <Text style={[styles.optionEnglish, selected && styles.optionEnglishSelected]}>
                    {lang.englishName}
                  </Text>
                )}
                {selected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        <Button
          label={t('common.continue')}
          onPress={handleContinue}
          fullWidth
          size="lg"
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#F97316',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1C1C1C',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  options: {
    gap: 12,
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  optionSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  optionNative: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    flex: 1,
  },
  optionNativeSelected: {
    color: '#F97316',
  },
  optionEnglish: {
    fontSize: 13,
    color: '#9CA3AF',
    marginRight: 8,
  },
  optionEnglishSelected: {
    color: '#F97316',
    opacity: 0.7,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cta: {
    marginTop: 'auto',
  },
})
