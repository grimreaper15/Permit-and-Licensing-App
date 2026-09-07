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

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ application_no?: string; id?: string }>();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const targetIdentifier = params.application_no || params.id;
  const { trackingData, isLoading, isRefreshing, error, refresh } = usePermitTracking(targetIdentifier);

  const applicationNo = trackingData?.application_no || params.application_no || `ID #${params.id || 'N/A'}`;
  const permitType = trackingData?.permit_type || 'Permit Application';
  const businessName = trackingData?.business_name || trackingData?.owner_name;
  const status = trackingData?.status || trackingData?.current_status || 'submitted';

  let dateApplied: string | null = null;
  if (trackingData?.created_at) {
    try {
      const d = new Date(trackingData.created_at);
      if (!isNaN(d.getTime())) {
        dateApplied = d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      dateApplied = trackingData.created_at;
    }
  }

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
          Application Details
        </Text>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() =>
            router.push({
              pathname: '/permit-and-licensing/tracking' as any,
              params: { application_no: applicationNo },
            })
          }
          activeOpacity={0.75}>
          <IconSymbol name="doc.text.fill" size={20} color={colors.accent} />
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
        {/* Header Summary Card */}
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.badgeRow}>
            <StatusBadge status={status} size="medium" />
            <Text style={[styles.appNoText, { color: colors.textMuted }]}>
              {applicationNo}
            </Text>
          </View>

          <Text style={[styles.permitTypeTitle, { color: colors.textPrimary }]}>
            {permitType}
          </Text>

          {businessName ? (
            <View style={styles.businessRow}>
              <IconSymbol name="building.2.fill" size={16} color={colors.textSecondary} />
              <Text style={[styles.businessText, { color: colors.textSecondary }]}>
                {businessName}
              </Text>
            </View>
          ) : null}

          {dateApplied ? (
            <View style={styles.metaRow}>
              <IconSymbol name="calendar" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                Applied on {dateApplied}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Loading Spinner */}
        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Fetching application records...
            </Text>
          </View>
        ) : null}

        {/* Error Card */}
        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.dangerLight, borderColor: isDarkMode ? '#991B1B' : '#FECACA' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              onPress={() => refresh()}
              activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Actionable Deficiencies Banner if present */}
        {trackingData?.deficiencies && trackingData.deficiencies.length > 0 ? (
          <DeficiencyBanner deficiencies={trackingData.deficiencies} />
        ) : null}

        {/* Payment Summary Assessment */}
        {trackingData?.payment ? (
          <PaymentSummaryCard payment={trackingData.payment} />
        ) : null}

        {/* Document Requirements & Screening Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="arrow.up.doc.fill" size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Document Requirements ({trackingData?.documents?.length || 0})
            </Text>
          </View>

          {trackingData?.documents && trackingData.documents.length > 0 ? (
            <View style={styles.docList}>
              {trackingData.documents.map((doc, idx) => (
                <View
                  key={doc.id || doc.requirement_id || idx}
                  style={[
                    styles.docMiniRow,
                    {
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={styles.docMiniLeft}>
                    <IconSymbol name="doc.text.fill" size={16} color={colors.accent} />
                    <View style={styles.docMiniTextCol}>
                      <Text style={[styles.docMiniName, { color: colors.textPrimary }]}>
                        {doc.document_name || doc.name || 'Document'}
                      </Text>
                      {doc.uploaded_at ? (
                        <Text style={[styles.docMiniMeta, { color: colors.textMuted }]}>
                          Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </Text>
                      ) : (
                        <Text style={[styles.docMiniMeta, { color: colors.textMuted }]}>
                          Pending upload
                        </Text>
                      )}
                    </View>
                  </View>
                  {doc.screening_status ? (
                    <StatusBadge status={doc.screening_status} size="small" />
                  ) : (
                    <StatusBadge status={doc.status || 'pending'} size="small" />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noDocsText, { color: colors.textMuted }]}>
              No document attachments on record yet.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.manageDocsBtn, { backgroundColor: colors.accent }]}
            onPress={() =>
              router.push({
                pathname: '/permit-and-licensing/upload' as any,
                params: {
                  application_no: applicationNo,
                  permit_id: String(trackingData?.permit_id || params.id || ''),
                },
              })
            }
            activeOpacity={0.85}>
            <IconSymbol name="arrow.up.doc.fill" size={14} color="#FFFFFF" />
            <Text style={styles.manageDocsBtnText}>Upload / Manage Documents</Text>
          </TouchableOpacity>
        </View>

        {/* Issuance Information if available */}
        {trackingData?.issuance?.permit_number ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeaderRow}>
              <IconSymbol name="checkmark.seal.fill" size={18} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Issued Permit Details</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Permit Number:</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {trackingData.issuance.permit_number}
              </Text>
            </View>
            {trackingData.issuance.valid_until ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Valid Until:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {trackingData.issuance.valid_until}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}


        {/* Timeline Preview Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="doc.text.fill" size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Progress Milestones</Text>
          </View>

          <TimelineView stages={trackingData?.timeline || []} />

          <TouchableOpacity
            style={[styles.fullTrackingBtn, { backgroundColor: isDarkMode ? '#0F2942' : '#F0F9FF', borderColor: colors.accent }]}
            onPress={() =>
              router.push({
                pathname: '/permit-and-licensing/tracking' as any,
                params: { application_no: applicationNo },
              })
            }
            activeOpacity={0.8}>
            <Text style={[styles.fullTrackingBtnText, { color: colors.accent }]}>
              Open Full Permit Tracker
            </Text>
            <IconSymbol name="chevron.right" size={14} color={colors.accent} />
          </TouchableOpacity>
        </View>
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
  headerCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appNoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  permitTypeTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  businessText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
  },
  centerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
  },
  errorCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  fullTrackingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  fullTrackingBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  docList: {
    gap: 8,
    marginBottom: 12,
  },
  docMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  docMiniLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  docMiniTextCol: {
    flex: 1,
    gap: 1,
  },
  docMiniName: {
    fontSize: 13,
    fontWeight: '600',
  },
  docMiniMeta: {
    fontSize: 11,
  },
  noDocsText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  manageDocsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  manageDocsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

