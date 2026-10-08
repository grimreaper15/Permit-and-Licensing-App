import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  DocumentUploadModal,
  PERMIT_COLORS,
  PermitApiError,
  PermitDocumentSummary,
  PermitRequirementItem,
  RequirementItem,
  submitForScreening,
  usePermitTracking,
} from '@/src/features/permit-and-licensing';

export default function DocumentUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ application_no?: string; permit_id?: string; id?: string }>();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const targetIdentifier = params.application_no || params.permit_id || params.id || '';
  const { trackingData, isLoading, isRefreshing, error, refresh } = usePermitTracking(targetIdentifier);

  const [selectedRequirement, setSelectedRequirement] = useState<PermitDocumentSummary | PermitRequirementItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applicationNo = trackingData?.application_no || params.application_no || `ID #${params.permit_id || params.id || 'N/A'}`;
  const permitId = trackingData?.permit_id || trackingData?.id || params.permit_id || params.id || '';
  const businessName = trackingData?.business_name || trackingData?.owner_name;
  const rawStatus = (trackingData?.status || trackingData?.current_status || '').toLowerCase().replace(/_/g, ' ').trim();
  const isAlreadySubmitted = !['draft', 'submitted', ''].includes(rawStatus);

  const requirementsSummary = trackingData?.requirements_summary;
  const legacyDocuments = trackingData?.documents || [];

  const handleOpenUploadForItem = (item: PermitRequirementItem) => {
    setSelectedRequirement(item);
    setShowUploadModal(true);
  };

  const handleOpenUploadForDoc = (doc: PermitDocumentSummary) => {
    setSelectedRequirement(doc);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    refresh();
  };

  const handleSubmitForScreening = async () => {
    if (isSubmitting) return;

    if (!requirementsSummary) {
      Alert.alert(
        'Checklist Unavailable',
        'Requirement checklist is unavailable. Refresh and try again.'
      );
      return;
    }

    if (!requirementsSummary.is_complete || requirementsSummary.missing_count > 0) {
      const missingNames = (requirementsSummary.missing || []).map((m) => `• ${m.name}`).join('\n');
      Alert.alert(
        'Incomplete Requirements',
        `Required documents are still missing:\n\n${missingNames}\n\nPlease upload all required documents before submitting.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitForScreening(applicationNo);
      Alert.alert(
        'Submission Successful',
        result.message || 'Application submitted for Document Screening.',
        [
          {
            text: 'View Tracking',
            onPress: () => {
              router.push({
                pathname: '/permit-and-licensing/tracking' as any,
                params: { application_no: applicationNo },
              });
            },
          },
          {
            text: 'OK',
            onPress: () => {
              refresh();
            },
          },
        ]
      );
      await refresh();
    } catch (err: any) {
      if (err instanceof PermitApiError && err.statusCode === 422) {
        // Structured missing requirements from Webhost 422
        const missingItems: any[] = err.data?.missing || [];
        const missingListText = missingItems.length > 0
          ? missingItems.map((m: any) => `• ${m.name || m.key || m}`).join('\n')
          : err.message || 'Required documents are still missing.';

        Alert.alert(
          'Missing Requirements',
          `Required documents are still missing:\n\n${missingListText}\n\nPlease upload the missing documents and try again.`
        );
        refresh();
      } else {
        Alert.alert(
          'Submission Failed',
          err.message || 'Failed to submit application for Document Screening. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress metrics from server-authoritative summary
  const totalRequired = requirementsSummary?.total_required || 0;
  const uploadedRequired = requirementsSummary?.uploaded_required || 0;
  const missingCount = requirementsSummary?.missing_count || 0;
  const progressPercent = totalRequired > 0 ? Math.min(100, Math.round((uploadedRequired / totalRequired) * 100)) : 0;
  const isComplete = requirementsSummary?.is_complete === true;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Nav */}
      <View style={[styles.topNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}>
          <IconSymbol name="chevron.left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>
          Document Requirements
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
        {/* Application Header Card */}
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.appNoText, { color: colors.accent }]}>{applicationNo}</Text>
              <Text style={[styles.permitTypeTitle, { color: colors.textPrimary }]}>
                {trackingData?.permit_type || 'Business Permit'}
              </Text>
            </View>
            <View
              style={[
                styles.docCountBadge,
                {
                  backgroundColor: requirementsSummary
                    ? isComplete
                      ? colors.successLight
                      : colors.warningLight
                    : isDarkMode
                    ? '#0F2942'
                    : '#E0F2FE',
                },
              ]}>
              <IconSymbol
                name={isComplete ? 'checkmark.circle.fill' : 'doc.text.fill'}
                size={12}
                color={requirementsSummary ? (isComplete ? colors.success : colors.warning) : colors.accent}
              />
              <Text
                style={[
                  styles.docCountText,
                  {
                    color: requirementsSummary
                      ? (isComplete ? colors.success : colors.warning)
                      : colors.accent,
                  },
                ]}>
                {requirementsSummary
                  ? isComplete
                    ? 'Requirements Complete'
                    : `${uploadedRequired} / ${totalRequired} Uploaded`
                  : `${legacyDocuments.length} Uploaded`}
              </Text>
            </View>
          </View>

          {businessName ? (
            <View style={styles.businessRow}>
              <IconSymbol name="building.2.fill" size={14} color={colors.textSecondary} />
              <Text style={[styles.businessText, { color: colors.textSecondary }]}>
                {businessName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Server Requirements Summary Progress Card */}
        {requirementsSummary ? (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryTopRow}>
              <Text style={[styles.summaryHeaderTitle, { color: colors.textSecondary }]}>
                DOCUMENT REQUIREMENTS
              </Text>
              <Text style={[styles.summaryRatioText, { color: isComplete ? colors.success : colors.accent }]}>
                {progressPercent}%
              </Text>
            </View>

            <Text style={[styles.summaryCounterHeadline, { color: colors.textPrimary }]}>
              {uploadedRequired} of {totalRequired} Required Documents Complete
            </Text>

            {/* Visual Progress Bar */}
            <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: isComplete ? colors.success : colors.accent,
                  },
                ]}
              />
            </View>

            <View style={styles.summaryMetaRow}>
              <Text style={[styles.summaryMetaItem, { color: colors.textMuted }]}>
                Complete: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{uploadedRequired} / {totalRequired}</Text>
              </Text>
              <Text style={[styles.summaryMetaItem, { color: colors.textMuted }]}>
                Remaining: <Text style={{ fontWeight: '700', color: missingCount > 0 ? colors.danger : colors.success }}>{missingCount}</Text>
              </Text>
            </View>
          </View>
        ) : null}

        {/* Missing Document Warning Banner */}
        {requirementsSummary && missingCount > 0 ? (
          <View style={[styles.warningBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
            <View style={styles.warningHeaderRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.warning} />
              <Text style={[styles.warningTitle, { color: colors.warning }]}>
                Missing Required Documents ({missingCount})
              </Text>
            </View>
            <Text style={[styles.warningBodyText, { color: colors.textPrimary }]}>
              {missingCount} required document{missingCount > 1 ? 's are' : ' is'} still missing. Upload all required documents before submitting your application for Document Screening.
            </Text>
            <View style={styles.missingListContainer}>
              {requirementsSummary.missing.map((missingItem) => (
                <View key={missingItem.key} style={styles.missingRowItem}>
                  <Text style={[styles.missingBullet, { color: colors.warning }]}>•</Text>
                  <Text style={[styles.missingNameText, { color: colors.textPrimary }]}>
                    {missingItem.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* AI Screening Guideline Notice */}
        <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
          <IconSymbol name="sparkles" size={16} color={colors.accent} />
          <View style={styles.infoCol}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
              Automated AI Document Screening
            </Text>
            <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
              Upload PDF, JPEG, or PNG documents (max 15 MB). Documents up to 1 MB undergo automated OCR and AI quality screening to assist LGU evaluation. Automated document screening is advisory and may require human review.
            </Text>
          </View>
        </View>

        {/* Loading Spinner */}
        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Fetching requirement status...
            </Text>
          </View>
        ) : null}

        {/* Error Card */}
        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.dangerLight }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.accent }]} onPress={() => refresh()} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Authoritative Server Requirements Checklist */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {requirementsSummary ? 'Required Document Checklist' : 'Current Document Attachments'}
          </Text>
          {requirementsSummary ? (
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Server-Authoritative
            </Text>
          ) : null}
        </View>

        {requirementsSummary ? (
          requirementsSummary.items.length > 0 ? (
            requirementsSummary.items.map((item) => (
              <RequirementItem
                key={item.key}
                item={item}
                onUploadOrReplace={handleOpenUploadForItem}
              />
            ))
          ) : (
            <View style={[styles.emptyDocsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol name="doc.fill" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyDocsTitle, { color: colors.textPrimary }]}>
                No Requirements Defined
              </Text>
              <Text style={[styles.emptyDocsSub, { color: colors.textMuted }]}>
                No mandatory municipal document requirements were assigned to this permit.
              </Text>
            </View>
          )
        ) : (
          /* Backward-compatible fallback when requirements_summary is absent */
          <>
            <View style={[styles.unavailableBanner, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
              <IconSymbol name="info.circle.fill" size={16} color={colors.textMuted} />
              <Text style={[styles.unavailableText, { color: colors.textMuted }]}>
                Authoritative requirement checklist is temporarily unavailable. Pull down to refresh.
              </Text>
            </View>

            {legacyDocuments.length > 0 ? (
              legacyDocuments.map((doc, idx) => (
                <RequirementItem
                  key={doc.id || doc.requirement_id || idx}
                  document={doc}
                  onUploadOrReplace={handleOpenUploadForDoc}
                />
              ))
            ) : (
              <View style={[styles.emptyDocsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <IconSymbol name="doc.fill" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyDocsTitle, { color: colors.textPrimary }]}>
                  No Documents Attached Yet
                </Text>
                <Text style={[styles.emptyDocsSub, { color: colors.textMuted }]}>
                  Pull down to refresh and connect with the municipal requirement checklist.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Screening Submission Section */}
        <View style={styles.submissionSection}>
          {isAlreadySubmitted ? (
            <View style={[styles.submittedCard, { backgroundColor: colors.card, borderColor: colors.success }]}>
              <View style={styles.submittedHeader}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                <Text style={[styles.submittedTitle, { color: colors.textPrimary }]}>
                  Submitted for Document Screening
                </Text>
              </View>
              <Text style={[styles.submittedBody, { color: colors.textSecondary }]}>
                Your application requirements have been submitted and are currently undergoing departmental document screening.
              </Text>
              <TouchableOpacity
                style={[styles.trackNavBtn, { backgroundColor: colors.accent, marginTop: 10 }]}
                onPress={() =>
                  router.push({
                    pathname: '/permit-and-licensing/tracking' as any,
                    params: { application_no: applicationNo },
                  })
                }
                activeOpacity={0.85}>
                <IconSymbol name="magnifyingglass" size={16} color="#FFFFFF" />
                <Text style={styles.trackNavBtnText}>View 7-Stage Milestone Tracking</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.submissionActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: isComplete ? colors.accent : (isDarkMode ? '#334155' : '#CBD5E1'),
                  },
                ]}
                onPress={handleSubmitForScreening}
                disabled={!isComplete || isSubmitting}
                activeOpacity={0.85}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol
                      name={isComplete ? 'arrow.up.circle.fill' : 'lock.fill'}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.submitBtnText}>Submit for Document Screening</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Helper explanation text */}
              <Text style={[styles.helperText, { color: isComplete ? colors.success : colors.textMuted }]}>
                {!requirementsSummary
                  ? 'Requirement checklist is unavailable. Refresh and try again.'
                  : !isComplete
                  ? 'Complete all required documents first.'
                  : 'All required documents complete. Tap to proceed to Document Screening.'}
              </Text>

              {/* Navigation to Tracking */}
              <TouchableOpacity
                style={[styles.trackNavBtnOutline, { borderColor: colors.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/permit-and-licensing/tracking' as any,
                    params: { application_no: applicationNo },
                  })
                }
                activeOpacity={0.85}>
                <IconSymbol name="magnifyingglass" size={16} color={colors.accent} />
                <Text style={[styles.trackNavBtnOutlineText, { color: colors.accent }]}>
                  View 7-Stage Milestone Tracking
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Interactive Upload Modal */}
      <DocumentUploadModal
        visible={showUploadModal}
        permitId={permitId}
        requirement={selectedRequirement}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
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
    gap: 12,
  },
  headerCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appNoText: {
    fontSize: 13,
    fontWeight: '800',
  },
  permitTypeTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  docCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  docCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  businessText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryRatioText: {
    fontSize: 13,
    fontWeight: '800',
  },
  summaryCounterHeadline: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  summaryMetaItem: {
    fontSize: 12,
  },
  warningBanner: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  warningBodyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  missingListContainer: {
    marginTop: 4,
    gap: 3,
    paddingLeft: 4,
  },
  missingRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  missingBullet: {
    fontSize: 14,
    fontWeight: '800',
  },
  missingNameText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  centerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
  },
  errorCard: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyDocsBox: {
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyDocsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyDocsSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  unavailableText: {
    fontSize: 12,
    flex: 1,
  },
  submissionSection: {
    marginTop: 8,
    gap: 10,
  },
  submissionActionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  trackNavBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  trackNavBtnOutlineText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submittedCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  submittedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submittedTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  submittedBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  trackNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  trackNavBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
