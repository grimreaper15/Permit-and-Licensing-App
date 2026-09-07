import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import {
  ApplicationCard,
  PERMIT_COLORS,
  usePermitApplications,
} from '@/src/features/permit-and-licensing';

export default function PermitDashboardScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const { applications, isLoading, isRefreshing, error, refresh } = usePermitApplications();

  // Dynamically compute real summary counts from live API data
  const totalCount = applications.length;
  const underReviewCount = applications.filter((app) => {
    const s = (app.status || app.current_status || '').toLowerCase();
    return s === 'under_review' || s === 'document_screening' || s === 'submitted' || s === 'pending';
  }).length;
  const actionRequiredCount = applications.filter((app) => {
    const s = (app.status || app.current_status || '').toLowerCase();
    return s === 'pending_requirements' || s === 'needs_action' || s === 'fee_assessment' || s === 'pending_payment';
  }).length;
  const approvedCount = applications.filter((app) => {
    const s = (app.status || app.current_status || '').toLowerCase();
    return s === 'approved' || s === 'issued' || s === 'payment_verified';
  }).length;

  const recentApplications = applications.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.topNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}>
          <IconSymbol name="chevron.left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>
          Permit & Licensing
        </Text>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.push('/permit-and-licensing/tracking' as any)}
          activeOpacity={0.75}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }>
        {/* Banner Card */}
        <View style={[styles.bannerCard, { backgroundColor: isDarkMode ? '#1C2541' : '#176B87', borderColor: colors.border }]}>
          <View style={styles.bannerIconBadge}>
            <IconSymbol name="doc.text.fill" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.bannerTitle}>Business Permits & Licensing Office</Text>
          <Text style={styles.bannerSub}>
            Track business permits, clearance evaluations, official fee assessments, and municipal licensing.
          </Text>
        </View>

        {/* Quick Action Navigation Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.accent, borderColor: colors.accent }]}
            onPress={() => router.push('/permit-and-licensing/apply' as any)}
            activeOpacity={0.85}>
            <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionCardTitle, { color: '#FFFFFF' }]}>Apply Permit</Text>
            <Text style={[styles.actionCardDesc, { color: '#E0F2FE' }]}>
              New BPLO application
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/permit-and-licensing/applications' as any)}
            activeOpacity={0.8}>
            <View style={[styles.actionIconCircle, { backgroundColor: colors.infoLight }]}>
              <IconSymbol name="doc.text.fill" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.actionCardTitle, { color: colors.textPrimary }]}>My Applications</Text>
            <Text style={[styles.actionCardDesc, { color: colors.textMuted }]}>
              {totalCount > 0 ? `${totalCount} records on file` : 'View all submissions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/permit-and-licensing/tracking' as any)}
            activeOpacity={0.8}>
            <View style={[styles.actionIconCircle, { backgroundColor: colors.successLight }]}>
              <IconSymbol name="magnifyingglass" size={20} color={colors.success} />
            </View>
            <Text style={[styles.actionCardTitle, { color: colors.textPrimary }]}>Track Permit</Text>
            <Text style={[styles.actionCardDesc, { color: colors.textMuted }]}>Live 7-stage progress</Text>
          </TouchableOpacity>
        </View>

        {/* Live Status Counter Overview */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Application Overview</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{totalCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{underReviewCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>In Review</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{actionRequiredCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Action Needed</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{approvedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Approved</Text>
          </View>
        </View>

        {/* Recent Applications Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Applications</Text>
          {applications.length > 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/permit-and-licensing/applications' as any)}
              activeOpacity={0.7}>
              <Text style={[styles.seeAllText, { color: colors.accent }]}>See All ({totalCount})</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Connecting to Permit Server...
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.dangerLight, borderColor: isDarkMode ? '#991B1B' : '#FECACA' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.danger} />
            <Text style={[styles.errorTitle, { color: colors.danger }]}>Connection Error</Text>
            <Text style={[styles.errorDesc, { color: colors.textPrimary }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              onPress={() => refresh()}
              activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : recentApplications.length > 0 ? (
          recentApplications.map((app) => (
            <ApplicationCard
              key={app.permit_id || app.id || app.application_no}
              application={app}
              onPress={(selected) => {
                router.push({
                  pathname: '/permit-and-licensing/details' as any,
                  params: {
                    application_no: selected.application_no,
                    id: String(selected.permit_id || selected.id || ''),
                  },
                });
              }}
            />
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="doc.text.fill" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Permit Applications</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              You currently do not have any submitted applications on file. Tap "Apply Permit" above to start your application.
            </Text>
          </View>
        )}

        {/* Business Permit Intake CTA Card */}
        <TouchableOpacity
          style={[styles.upcomingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/permit-and-licensing/apply' as any)}
          activeOpacity={0.85}>
          <View style={styles.upcomingHeader}>
            <IconSymbol name="building.2.fill" size={18} color={colors.accent} />
            <Text style={[styles.upcomingTitle, { color: colors.textPrimary }]}>
              New Business Permit Application
            </Text>
            <View style={[styles.upcomingBadge, { backgroundColor: isDarkMode ? '#0369A1' : '#E0F2FE' }]}>
              <Text style={[styles.upcomingBadgeText, { color: colors.accent }]}>Apply Now</Text>
            </View>
          </View>
          <Text style={[styles.upcomingDesc, { color: colors.textMuted }]}>
            Submit your municipal BPLO application online, attach required clearances, and track AI-assisted document screening.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  bannerCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  bannerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: '#E0F2FE',
    lineHeight: 18,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  centerContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  errorCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  upcomingCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  upcomingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  upcomingDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
});
