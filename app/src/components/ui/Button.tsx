import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#F97316'}
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primary: {
    backgroundColor: '#F97316',
  },
  secondary: {
    backgroundColor: '#1C1C1C',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#F97316',
  },
  danger: {
    backgroundColor: '#EF4444',
  },

  // Sizes
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },

  // Text
  text: {
    fontWeight: '700',
  },
  text_primary: { color: '#FFFFFF' },
  text_secondary: { color: '#FFFFFF' },
  text_ghost: { color: '#F97316' },
  text_danger: { color: '#FFFFFF' },
  text_sm: { fontSize: 13 },
  text_md: { fontSize: 15 },
  text_lg: { fontSize: 17 },
})
