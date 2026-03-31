import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  prefix?: string
  containerStyle?: ViewStyle
}

export function Input({
  label,
  error,
  hint,
  prefix,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          error ? styles.inputRowError : null,
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputRowFocused: {
    borderColor: '#F97316',
    backgroundColor: '#FFFFFF',
  },
  inputRowError: {
    borderColor: '#EF4444',
  },
  prefix: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 6,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1C',
    paddingVertical: 0,
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
})
