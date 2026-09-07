import React, { useState } from 'react';
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
  DocumentUploadModal,
  PERMIT_COLORS,
  PermitDocumentSummary,
  RequirementItem,
  usePermitTracking,
} from '@/src/features/permit-and-licensing';

const COMMON_DOCUMENT_PRESETS = [
  'Barangay Business Clearance',
  'DTI / SEC Registration Certificate',
  'Lease Contract / Proof of Property Ownership',
  'Fire Safety Inspection Certificate (FSIC)',
  'Occupancy Permit / Building Clearance',
  'Sanitary Clearance',
];

export default function DocumentUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ application_no?: string; permit_id?: string; id?: string }>();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const targetIdentifier = params.application_no || params.permit_id || params.id || '';
  const { trackingData, isLoading, isRefreshing, error, refresh } = usePermitTracking(targetIdentifier);

  const [selectedRequirement, setSelectedRequirement] = useState<PermitDocumentSummary | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customDocType, setCustomDocType] = useState<string | null>(null);

  const applicationNo = trackingData?.application_no || params.application_no || `ID #${params.permit_id || params.id || 'N/A'}`;
  const permitId = trackingData?.permit_id || trackingData?.id || params.permit_id || params.id || '';
  const businessName = trackingData?.business_name || trackingData?.owner_name;
  const documents = trackingData?.documents || [];

  const handleOpenUploadForDoc = (doc: PermitDocumentSummary) => {
    setSelectedRequirement(doc);
    setShowUploadModal(true);
  };

  const handleOpenNewUpload = (docName: string) => {
    setSelectedRequirement({
      document_name: docName,
      name: docName,
      status: 'pending',
    });
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    refresh();
  };

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
            <View style={[styles.docCountBadge, { backgroundColor: isDarkMode ? '#0F2942' : '#E0F2FE' }]}>
              <IconSymbol name="doc.text.fill" size={12} color={colors.accent} />
              <Text style={[styles.docCountText, { color: colors.accent }]}>
                {documents.length} Uploaded
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

        {/* AI Screening Guideline Notice */}
        <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
          <IconSymbol name="sparkles" size={16} color={colors.accent} />
          <View style={styles.infoCol}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
              Automated AI Document Screening
            </Text>
            <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
              Upload PDF, JPEG, or PNG documents (max 15 MB). Documents up to 1 MB undergo automated OCR and AI quality screening to assist LGU evaluation.
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

        {/* Live Uploaded Documents List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Current Document Attachments
          </Text>
        </View>

        {documents.length > 0 ? (
          documents.map((doc, idx) => (
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
              Attach the required municipal documents below to proceed with departmental screening.
            </Text>
          </View>
        )}

        {/* Attach Document by Type Presets */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Attach Standard Requirement
          </Text>
        </View>

        <View style={styles.presetsGrid}>
          {COMMON_DOCUMENT_PRESETS.map((preset) => {
            const alreadyUploaded = documents.some(
              (d) => (d.document_name || d.name || '').toLowerCase() === preset.toLowerCase()
            );

            return (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: alreadyUploaded ? colors.success : colors.border,
                  },
                ]}
                onPress={() => handleOpenNewUpload(preset)}
                activeOpacity={0.75}>
                <View style={[styles.presetIconCircle, { backgroundColor: alreadyUploaded ? colors.successLight : colors.infoLight }]}>
                  <IconSymbol
                    name={alreadyUploaded ? 'checkmark.circle.fill' : 'arrow.up.doc.fill'}
                    size={16}
                    color={alreadyUploaded ? colors.success : colors.accent}
                  />
                </View>
                <View style={styles.presetTextCol}>
                  <Text style={[styles.presetName, { color: colors.textPrimary }]}>{preset}</Text>
                  <Text style={[styles.presetStatus, { color: alreadyUploaded ? colors.success : colors.textMuted }]}>
                    {alreadyUploaded ? 'Uploaded (Tap to Replace)' : 'Tap to Upload'}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation to Tracking */}
        <TouchableOpacity
          style={[styles.trackNavBtn, { backgroundColor: colors.accent }]}
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
  presetsGrid: {
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  presetIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTextCol: {
    flex: 1,
    gap: 1,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
  },
  presetStatus: {
    fontSize: 11,
  },
  trackNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  trackNavBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
