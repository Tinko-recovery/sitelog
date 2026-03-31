import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useTenant } from '../../hooks/useTenant'
import { StatCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export function DashboardScreen() {
  const { t } = useTranslation()
  const { tenantName, role } = useAuthStore()
  const { tenant, sites, isLoading, isReadOnly, isTrialExpired, trialDaysRemaining } = useTenant()
  const [selectedSiteId, setSelectedSiteId] = useState<string | 'all'>('all')

  const roleBadgeKey = role === 'master'
    ? 'dashboard.role_badge_master'
    : role === 'operator'
    ? 'dashboard.role_badge_operator'
    : 'dashboard.role_badge_viewer'

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Status banners ── */}
      {isReadOnly && (
        <View style={styles.bannerDanger}>
          <Text style={styles.bannerText}>{t('dashboard.read_only_banner')}</Text>
        </View>
      )}
      {isTrialExpired && (
        <View style={styles.bannerDanger}>
          <Text style={styles.bannerText}>{t('dashboard.trial_expired')}</Text>
        </View>
      )}
      {!isTrialExpired && trialDaysRemaining !== null && trialDaysRemaining <= 7 && (
        <View style={styles.bannerWarning}>
          <Text style={styles.bannerText}>
            {t('dashboard.trial_banner', { days: trialDaysRemaining })}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.tenantName}>{tenantName ?? tenant?.name ?? '—'}</Text>
            <Text style={styles.headerSub}>{t('dashboard.title')}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{t(roleBadgeKey)}</Text>
          </View>
        </View>

        {/* ── Site selector ── */}
        {sites.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.siteTabs}
          >
            <TouchableOpacity
              onPress={() => setSelectedSiteId('all')}
              style={[styles.siteTab, selectedSiteId === 'all' && styles.siteTabActive]}
            >
              <Text style={[styles.siteTabText, selectedSiteId === 'all' && styles.siteTabTextActive]}>
                {t('dashboard.all_sites')}
              </Text>
            </TouchableOpacity>
            {sites.map((site) => (
              <TouchableOpacity
                key={site.id}
                onPress={() => setSelectedSiteId(site.id)}
                style={[styles.siteTab, selectedSiteId === site.id && styles.siteTabActive]}
              >
                <Text style={[styles.siteTabText, selectedSiteId === site.id && styles.siteTabTextActive]}>
                  {site.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Stat cards ── */}
        <View style={styles.statsRow}>
          <StatCard
            label={t('dashboard.total_spent')}
            value="₹0"
            accent
            style={styles.statFlex}
          />
          <StatCard
            label={t('dashboard.pending_approvals')}
            value="0"
            style={styles.statFlex}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard label={t('dashboard.material_spend')} value="₹0" style={styles.statFlex} />
          <StatCard label={t('dashboard.labour_spend')} value="₹0" style={styles.statFlex} />
          <StatCard label={t('dashboard.service_spend')} value="₹0" style={styles.statFlex} />
        </View>

        {/* ── Empty state ── */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>{t('dashboard.no_entries_title')}</Text>
          <Text style={styles.emptySubtitle}>{t('dashboard.no_entries_subtitle')}</Text>

          {role !== 'viewer' && (
            <Button
              label={t('dashboard.add_entry')}
              onPress={() => {
                // Phase 2: navigate to entry form
              }}
              size="md"
              style={styles.addBtn}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  bannerDanger: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerWarning: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1C1C',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  siteTabs: {
    gap: 8,
    paddingVertical: 4,
  },
  siteTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  siteTabActive: {
    backgroundColor: '#1C1C1C',
    borderColor: '#1C1C1C',
  },
  siteTabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  siteTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statFlex: { flex: 1 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  addBtn: { marginTop: 24 },
})
