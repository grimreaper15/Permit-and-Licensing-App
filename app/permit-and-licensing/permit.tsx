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
  PaymentSummaryCard,
  PERMIT_COLORS,
  PermitVerificationBadge,
  StatusBadge,
  usePermitTracking,
} from '@/src/features/permit-and-licensing';

export default function DigitalPermitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ application_no?: string; id?: string }>();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const targetIdentifier = params.application_no || params.id;
  const { trackingData, isLoading, isRefreshing, error, refresh } = usePermitTracking(targetIdentifier);

  const applicationNo = trackingData?.application_no || params.application_no || `ID #${params.id || 'N/A'}`;
  const permitType = trackingData?.permit_type || 'Business Permit';
  const businessName = trackingData?.business_name || trackingData?.owner_name || 'N/A';
  const status = trackingData?.status || trackingData?.current_status || 'submitted';

  const issuance = trackingData?.issuance;
  const isOfficiallyIssued =
    issuance?.status?.toLowerCase() === 'issued' ||
    trackingData?.issuance_status?.toLowerCase() === 'issued' ||
    status.toLowerCase() === 'issued';

  const permitNumber = issuance?.permit_number || (isOfficiallyIssued ? applicationNo : 'Pending Issuance');
  const issuedDate = issuance?.issued_at || null;
  const validUntil = issuance?.valid_until || issuance?.expiry_date || null;
  const verificationToken = issuance?.verification_token || null;
  const issuanceBlockReason = trackingData?.issuance_block_reason || null;

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
          Digital Permit Metadata
        </Text>
        <TouchableOpacity
          style={styles.verifyNavBtn}
          onPress={() =>
            router.push({
              pathname: '/permit-and-licensing/verify-qr' as any,
              params: verificationToken ? { token: verificationToken } : undefined,
            })
          }
          activeOpacity={0.75}>
          <IconSymbol name="checkmark.shield.fill" size={20} color={colors.accent} />
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
        {/* Loading Spinner */}
        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Loading digital permit records...
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.dangerLight, borderColor: isDarkMode ? '#991B1B' : '#FECACA' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.danger} />
            <Text style={[styles.errorTitle, { color: colors.danger }]}>Unable to Load Permit</Text>
            <Text style={[styles.errorDesc, { color: colors.textPrimary }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              onPress={() => refresh()}
              activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Non-Issued Notice Banner if not yet issued */}
            {!isOfficiallyIssued ? (
              <View style={[styles.noticeBanner, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
                <IconSymbol name="info.circle.fill" size={18} color={colors.accent} />
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                  This permit has not been officially released yet. The details below reflect current municipal records.
                </Text>
              </View>
            ) : null}

            {/* Official Permit Header Card */}
            <View style={[styles.card, styles.officialCard, { backgroundColor: colors.card, borderColor: isOfficiallyIssued ? (isDarkMode ? '#059669' : '#10B981') : colors.border }]}>
              <View style={styles.officialHeaderRow}>
                <View style={styles.officialBadgeWrap}>
                  <PermitVerificationBadge
                    status={isOfficiallyIssued ? 'VALID' : 'NOT_ISSUED'}
                    size="medium"
                  />
                </View>
                <Text style={[styles.officialHeaderTag, { color: colors.textMuted }]}>
                  Republic of the Philippines
                </Text>
              </View>

              <Text style={[styles.businessTitle, { color: colors.textPrimary }]}>
                {businessName}
              </Text>

              <Text style={[styles.permitTypeSubtitle, { color: colors.accent }]}>
                {permitType}
              </Text>

              <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Permit Number</Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                    {permitNumber}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Application Reference</Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                    {applicationNo}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status & Lifecycle Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <IconSymbol name="checkmark.circle.fill" size={18} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Municipal Status Overview</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Application Status:</Text>
                <StatusBadge status={status} size="small" />
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Approval Status:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {trackingData?.approval_status || (trackingData as any)?.approval?.status || 'Pending'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Status:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {trackingData?.payment_status || (trackingData as any)?.payment?.payment_status || 'Pending Assessment'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Issuance Status:</Text>
                <Text style={[styles.detailValue, { color: isOfficiallyIssued ? colors.success : colors.textPrimary }]}>
                  {issuance?.status || trackingData?.issuance_status || (isOfficiallyIssued ? 'Issued' : 'Pending Issuance')}
                </Text>
              </View>
            </View>

            {/* Issuance & Validity Section */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <IconSymbol name="checkmark.seal.fill" size={18} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Issuance Record</Text>
              </View>

              {issuedDate ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date Issued:</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{issuedDate}</Text>
                </View>
              ) : (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date Issued:</Text>
                  <Text style={[styles.detailValue, { color: colors.textMuted }]}>Awaiting official release</Text>
                </View>
              )}

              {/* Authoritative Expiry Only - omitted if backend has no real expiry value */}
              {validUntil ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Valid Until:</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{validUntil}</Text>
                </View>
              ) : null}

              {issuanceBlockReason ? (
                <View style={[styles.blockReasonBox, { backgroundColor: isDarkMode ? '#451A0320' : '#FFFBEB', borderColor: isDarkMode ? '#D97706' : '#FDE68A' }]}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#D97706" />
                  <Text style={[styles.blockReasonText, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
                    Issuance Note: {issuanceBlockReason}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Verification Token Section */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <IconSymbol name="shield.lefthalf.filled" size={18} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Official Verification Code
                </Text>
              </View>

              <Text style={[styles.tokenExplainer, { color: colors.textMuted }]}>
                This unique opaque cryptographic token authenticates this permit against the city verification system.
              </Text>

              {verificationToken ? (
                <>
                  <View
                    style={[
                      styles.tokenBox,
                      {
                        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                        borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                      },
                    ]}>
                    <Text
                      selectable={true}
                      style={[styles.tokenText, { color: colors.textPrimary }]}>
                      {verificationToken}
                    </Text>
                  </View>

                  <Text style={[styles.copyHelperText, { color: colors.textMuted }]}>
                    Verification code is selectable. Tap and hold above to copy.
                  </Text>

                  <TouchableOpacity
                    style={[styles.verifyActionBtn, { backgroundColor: colors.accent }]}
                    onPress={() =>
                      router.push({
                        pathname: '/permit-and-licensing/verify-qr' as any,
                        params: { token: verificationToken },
                      })
                    }
                    activeOpacity={0.85}>
                    <IconSymbol name="checkmark.shield.fill" size={16} color="#FFFFFF" />
                    <Text style={styles.verifyActionBtnText}>Verify Authenticity</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={[styles.noTokenBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                  <IconSymbol name="lock.fill" size={16} color={colors.textMuted} />
                  <Text style={[styles.noTokenText, { color: colors.textMuted }]}>
                    Verification code is not available yet. It will be generated upon official issuance and payment clearance.
                  </Text>
                </View>
              )}
            </View>

            {/* Payment & Assessment Summary */}
            {trackingData?.payment ? (
              <PaymentSummaryCard payment={trackingData.payment} />
            ) : null}

            {/* Disclaimer Footer Card */}
            <View style={[styles.disclaimerCard, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
              <IconSymbol name="info.circle.fill" size={16} color={colors.textMuted} />
              <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
                This Digital Permit view provides real-time metadata synchronized with the municipal BPLO registry. Official physical permits and framed certificates are issued by the city licensing division.
              </Text>
            </View>
          </>
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
  verifyNavBtn: {
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
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
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
    marginTop: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
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
  officialCard: {
    borderWidth: 1.5,
  },
  officialHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  officialBadgeWrap: {
    flex: 1,
  },
  officialHeaderTag: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  businessTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  permitTypeSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  metaDivider: {
    height: 1,
    marginVertical: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
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
  blockReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  blockReasonText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  tokenExplainer: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  tokenBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  copyHelperText: {
    fontSize: 11,
    marginBottom: 12,
  },
  verifyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  verifyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  noTokenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  noTokenText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
