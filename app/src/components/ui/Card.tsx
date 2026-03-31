import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'

interface CardProps {
  title?: string
  children: React.ReactNode
  style?: ViewStyle
}

export function Card({ title, children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  )
}

// Stat card used on the dashboard (Total Spent, Pending, etc.)
interface StatCardProps {
  label: string
  value: string
  accent?: boolean
  style?: ViewStyle
}

export function StatCard({ label, value, accent = false, style }: StatCardProps) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent, style]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 12,
  },

  // Stat card
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardAccent: {
    backgroundColor: '#F97316',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  statValueAccent: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statLabelAccent: {
    color: 'rgba(255,255,255,0.85)',
  },
})
