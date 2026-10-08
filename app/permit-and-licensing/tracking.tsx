import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import {
  DeficiencyBanner,
  PaymentSummaryCard,
  PERMIT_COLORS,
  StatusBadge,
  TimelineView,
  usePermitTracking,
} from '@/src/features/permit-and-licensing';

export default function PermitTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ application_no?: string }>();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const [inputAppNo, setInputAppNo] = useState(params.application_no || '');
  const [activeTrackingNo, setActiveTrackingNo] = useState(params.application_no || '');

  const { trackingData, isLoading, isRefreshing, error, refresh, trackApplication } =
    usePermitTracking(activeTrackingNo);

  const handleSearch = () => {
    const trimmed = inputAppNo.trim();
    if (!trimmed) return;
    setActiveTrackingNo(trimmed);
    trackApplication(trimmed);
  };

  const status = trackingData?.status || trackingData?.current_status || 'submitted';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Nav Bar */}
      <View style={[styles.topNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}>
          <IconSymbol name="chevron.left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>
          Permit Tracking
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Application Lookup Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.searchLabel, { color: colors.textSecondary }]}>
          Enter Application / Reference Number:
        </Text>
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9',
                borderColor: colors.border,
              },
            ]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              placeholder="e.g. BP-2026-0001"
              placeholderTextColor={colors.textMuted}
              value={inputAppNo}
              onChangeText={setInputAppNo}
              onSubmitEditing={handleSearch}
              autoCapitalize="characters"
              returnKeyType="search"
            />
            {inputAppNo ? (
              <TouchableOpacity onPress={() => setInputAppNo('')} activeOpacity={0.7}>
                <IconSymbol name="eye.slash.fill" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.trackSubmitBtn, { backgroundColor: colors.accent }]}
            onPress={handleSearch}
            activeOpacity={0.8}>
            <Text style={styles.trackSubmitBtnText}>Track</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTrackingNo ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          ) : undefined
        }>
        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Retrieving live milestone tracking...
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.dangerLight, borderColor: isDarkMode ? '#991B1B' : '#FECACA' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={28} color={colors.danger} />
            <Text style={[styles.errorTitle, { color: colors.danger }]}>Application Not Found</Text>
            <Text style={[styles.errorDesc, { color: colors.textPrimary }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              onPress={() => refresh()}
              activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : trackingData ? (
          <>
            {/* Header Application Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoHeaderRow}>
                <Text style={[styles.appNoTitle, { color: colors.textPrimary }]}>
                  {trackingData.application_no}
                </Text>
                <StatusBadge status={status} size="small" />
              </View>

              <Text style={[styles.permitTypeSub, { color: colors.textSecondary }]}>
                {trackingData.permit_type || 'Permit Application'}
              </Text>

              {trackingData.business_name ? (
                <View style={styles.businessRow}>
                  <IconSymbol name="building.2.fill" size={14} color={colors.textSecondary} />
                  <Text style={[styles.businessNameText, { color: colors.textSecondary }]}>
                    {trackingData.business_name}
                  </Text>
                </View>
              ) : null}

              {trackingData.requirements_summary ? (
                <TouchableOpacity
                  style={[
                    styles.reqSummaryRow,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/permit-and-licensing/upload' as any,
                      params: { application_no: trackingData.application_no },
                    })
                  }
                  activeOpacity={0.8}>
                  <View style={styles.reqSummaryLeft}>
                    <IconSymbol
                      name={trackingData.requirements_summary.is_complete ? 'checkmark.circle.fill' : 'doc.text.fill'}
                      size={14}
                      color={trackingData.requirements_summary.is_complete ? colors.success : colors.accent}
                    />
                    <Text style={[styles.reqSummaryText, { color: colors.textPrimary }]}>
                      Requirements:{' '}
                      <Text
                        style={{
                          fontWeight: '700',
                          color: trackingData.requirements_summary.is_complete ? colors.success : colors.accent,
                        }}>
                        {trackingData.requirements_summary.is_complete
                          ? 'Requirements Complete'
                          : `${trackingData.requirements_summary.uploaded_required} / ${trackingData.requirements_summary.total_required} Uploaded`}
                      </Text>
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={12} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Actionable Deficiencies Banner */}
            {trackingData.deficiencies && trackingData.deficiencies.length > 0 ? (
              <DeficiencyBanner deficiencies={trackingData.deficiencies} />
            ) : null}

            {/* 7-Stage Live Timeline */}
            <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <IconSymbol name="checkmark.circle.fill" size={18} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  7-Stage Evaluation Timeline
                </Text>
              </View>
              <TimelineView stages={trackingData.timeline || []} />
            </View>

            {/* Payment Summary Assessment */}
            {trackingData.payment ? (
              <PaymentSummaryCard payment={trackingData.payment} />
            ) : null}

            {/* Issuance Status */}
            {trackingData.issuance?.permit_number ? (
              <View style={[styles.issuanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeaderRow}>
                  <IconSymbol name="checkmark.seal.fill" size={18} color={colors.success} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Permit Issuance Record
                  </Text>
                </View>
                <View style={styles.issuanceDetailRow}>
                  <Text style={[styles.issuanceLabel, { color: colors.textSecondary }]}>
                    Permit Number:
                  </Text>
                  <Text style={[styles.issuanceValue, { color: colors.textPrimary }]}>
                    {trackingData.issuance.permit_number}
                  </Text>
                </View>
                {trackingData.issuance.valid_until ? (
                  <View style={styles.issuanceDetailRow}>
                    <Text style={[styles.issuanceLabel, { color: colors.textSecondary }]}>
                      Validity:
                    </Text>
                    <Text style={[styles.issuanceValue, { color: colors.textPrimary }]}>
                      Until {trackingData.issuance.valid_until}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </>
        ) : (
          <View style={[styles.emptyPromptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyPromptTitle, { color: colors.textPrimary }]}>
              Track Your Permit
            </Text>
            <Text style={[styles.emptyPromptDesc, { color: colors.textMuted }]}>
              Enter your application reference number above to view real-time evaluation status, milestone timeline, payment assessments, and clearance milestones.
            </Text>
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  searchLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    fontWeight: '600',
  },
  trackSubmitBtn: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  errorCard: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appNoTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  permitTypeSub: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  businessNameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reqSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  reqSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  reqSummaryText: {
    fontSize: 12,
  },
  timelineCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  issuanceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  issuanceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  issuanceLabel: {
    fontSize: 13,
  },
  issuanceValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyPromptCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 20,
    gap: 10,
  },
  emptyPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyPromptDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
