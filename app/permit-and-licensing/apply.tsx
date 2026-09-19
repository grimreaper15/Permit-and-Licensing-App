import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import {
  OwnershipType,
  PERMIT_COLORS,
  usePermitSubmission,
} from '@/src/features/permit-and-licensing';

interface PermitTypeOption {
  id: string;
  name: string;
  department: string;
  description: string;
  isAvailable: boolean;
  unavailableReason?: string;
  icon: string;
}

const PERMIT_TYPES: PermitTypeOption[] = [
  {
    id: 'Business Permit',
    name: 'Business Permit & Licensing (BPLO)',
    department: 'Business Permits & Licensing Office',
    description: 'New municipal business license, tax clearance intake, and commercial operations permit.',
    isAvailable: true,
    icon: 'briefcase.fill',
  },
  {
    id: 'Building Permit',
    name: 'Building Permit (OCBO)',
    department: 'Office of the City Building Official',
    description: 'Architectural, structural, and construction clearances.',
    isAvailable: false,
    unavailableReason: 'Not yet available on Mobile',
    icon: 'building.2.fill',
  },
  {
    id: 'Occupancy Permit',
    name: 'Certificate of Occupancy',
    department: 'Office of the City Building Official',
    description: 'Final structure inspection and occupancy certification.',
    isAvailable: false,
    unavailableReason: 'Not yet available on Mobile',
    icon: 'house.fill',
  },
  {
    id: 'Transport Franchise',
    name: 'Transport Franchise (TPRO)',
    department: 'Traffic & Transport Management Office',
    description: 'Motorized tricycle, public conveyance, and route operating license.',
    isAvailable: false,
    unavailableReason: 'Not yet available on Mobile',
    icon: 'car.fill',
  },
];

const OWNERSHIP_OPTIONS: OwnershipType[] = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
];

const LINE_OF_BUSINESS_PRESETS = [
  'General Merchandise',
  'Retail Store / Sari-sari',
  'Food & Beverage / Restaurant',
  'Information Technology / Services',
  'Professional & Consultancy Services',
  'Manufacturing & Assembly',
  'Healthcare & Pharmacy',
  'Logistics & Warehousing',
];

export default function ApplyPermitScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const [selectedType, setSelectedType] = useState('Business Permit');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { formState, updateField, isSubmitting, error, submitResult, submit } =
    usePermitSubmission();

  const handleSubmit = async () => {
    const result = await submit();
    if (result) {
      setShowSuccessModal(true);
    }
  };

  const handleNavigateToUpload = () => {
    setShowSuccessModal(false);
    if (submitResult) {
      router.replace({
        pathname: '/permit-and-licensing/upload' as any,
        params: {
          permit_id: String(submitResult.permit_id),
          application_no: submitResult.application_no,
        },
      });
    }
  };

  const handleNavigateToTracking = () => {
    setShowSuccessModal(false);
    if (submitResult) {
      router.replace({
        pathname: '/permit-and-licensing/tracking' as any,
        params: {
          application_no: submitResult.application_no,
        },
      });
    }
  };

  const handleNavigateToApplications = () => {
    setShowSuccessModal(false);
    router.replace('/permit-and-licensing/applications' as any);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top Nav Bar */}
      <View style={[styles.topNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}>
          <IconSymbol name="chevron.left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>
          Apply for Permit
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Section 1: Permit Type Selector */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            1. Select Permit Type
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Choose the municipal permit category for this application.
          </Text>
        </View>

        <View style={styles.typeList}>
          {PERMIT_TYPES.map((pt) => {
            const isSelected = selectedType === pt.id;
            const isAvailable = pt.isAvailable;

            return (
              <TouchableOpacity
                key={pt.id}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                    opacity: isAvailable ? 1 : 0.65,
                  },
                ]}
                onPress={() => {
                  if (isAvailable) {
                    setSelectedType(pt.id);
                    updateField('permit_type', pt.id);
                  }
                }}
                disabled={!isAvailable}
                activeOpacity={0.8}>
                <View style={styles.typeCardHeader}>
                  <View
                    style={[
                      styles.typeIconCircle,
                      {
                        backgroundColor: isSelected
                          ? colors.accent
                          : isAvailable
                          ? (isDarkMode ? '#334155' : '#E2E8F0')
                          : (isDarkMode ? '#1E293B' : '#F1F5F9'),
                      },
                    ]}>
                    <IconSymbol
                      name={pt.icon as any}
                      size={18}
                      color={isSelected ? '#FFFFFF' : isAvailable ? colors.accent : colors.textMuted}
                    />
                  </View>
                  <View style={styles.typeTitleCol}>
                    <Text style={[styles.typeName, { color: colors.textPrimary }]}>
                      {pt.name}
                    </Text>
                    <Text style={[styles.typeDept, { color: colors.textSecondary }]}>
                      {pt.department}
                    </Text>
                  </View>
                  {!isAvailable ? (
                    <View style={[styles.disabledBadge, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
                      <Text style={[styles.disabledBadgeText, { color: colors.textMuted }]}>
                        {pt.unavailableReason || 'Unavailable'}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected ? colors.accent : colors.border,
                          backgroundColor: isSelected ? colors.accent : 'transparent',
                        },
                      ]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  )}
                </View>
                <Text style={[styles.typeDesc, { color: colors.textMuted }]}>
                  {pt.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 2: Business & Enterprise Information */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            2. Business Information
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Enter legal business and registration details.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Business Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Business / Trade Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. San Pedro General Trading"
              placeholderTextColor={colors.textMuted}
              value={formState.business_name}
              onChangeText={(val) => updateField('business_name', val)}
            />
          </View>

          {/* Business Address */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Business Location / Address <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Unit 102, Mabini St., Poblacion"
              placeholderTextColor={colors.textMuted}
              value={formState.business_address}
              onChangeText={(val) => updateField('business_address', val)}
            />
          </View>

          {/* Line of Business */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Line of Business / Activity <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Retail Merchandising"
              placeholderTextColor={colors.textMuted}
              value={formState.line_of_business}
              onChangeText={(val) => updateField('line_of_business', val)}
            />

            {/* Quick Preset Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {LINE_OF_BUSINESS_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        formState.line_of_business === preset
                          ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                          : (isDarkMode ? '#1E293B' : '#F1F5F9'),
                      borderColor:
                        formState.line_of_business === preset ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => updateField('line_of_business', preset)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color:
                          formState.line_of_business === preset ? colors.accent : colors.textSecondary,
                        fontWeight: formState.line_of_business === preset ? '700' : '500',
                      },
                    ]}>
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Ownership Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Legal Ownership Type
            </Text>
            <View style={styles.ownershipGrid}>
              {OWNERSHIP_OPTIONS.map((opt) => {
                const isSelected = formState.ownership_type === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.ownershipChip,
                      {
                        backgroundColor: isSelected
                          ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                          : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => updateField('ownership_type', opt)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.ownershipChipText,
                        {
                          color: isSelected ? colors.accent : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section 3: Operations & Scale */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            3. Operations & Capital Details
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Used by LGU for statutory fee assessment and clearance sizing.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.twoColRow}>
            {/* Capital Investment */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Capital (₱)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="50000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formState.capital_investment}
                onChangeText={(val) => updateField('capital_investment', val)}
              />
            </View>

            {/* Estimated Gross Sales */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Gross Sales (₱)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formState.gross_sales}
                onChangeText={(val) => updateField('gross_sales', val)}
              />
            </View>
          </View>

          <View style={styles.twoColRow}>
            {/* Number of Employees */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Employees
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="1"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={formState.number_of_employees}
                onChangeText={(val) => updateField('number_of_employees', val)}
              />
            </View>

            {/* Floor Area */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Floor Area (sq.m.)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="25.0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formState.floor_area_sqm}
                onChangeText={(val) => updateField('floor_area_sqm', val)}
              />
            </View>
          </View>
        </View>

        {/* Error Card */}
        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.dangerLight }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : null}

        {/* Certification Notice */}
        <View style={[styles.noticeCard, { backgroundColor: isDarkMode ? '#0F2942' : '#F0F9FF', borderColor: colors.accent }]}>
          <IconSymbol name="info.circle.fill" size={16} color={colors.accent} />
          <Text style={[styles.noticeText, { color: colors.textPrimary }]}>
            By submitting this application, you attest that the information provided is true and correct in accordance with municipal ordinances. Required document attachments will be uploaded in the next step.
          </Text>
        </View>

        {/* Submit Action Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.accent }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol name="arrow.right.circle.fill" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Real Application Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.successLight }]}>
              <IconSymbol name="checkmark.circle.fill" size={44} color={colors.success} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Application Submitted!
            </Text>

            <Text style={[styles.modalSub, { color: colors.textMuted }]}>
              Your Business Permit application has been registered with the municipal licensing database.
            </Text>

            {submitResult ? (
              <View style={[styles.appDetailsBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Application No:</Text>
                  <Text style={[styles.detailValue, { color: colors.accent }]}>
                    {submitResult.application_no}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Permit ID:</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    #{submitResult.permit_id}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Business Name:</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {submitResult.business_name}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Status:</Text>
                  <Text style={[styles.detailValue, { color: colors.success }]}>
                    {submitResult.status}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Next Step Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.accent }]}
                onPress={handleNavigateToUpload}
                activeOpacity={0.85}>
                <IconSymbol name="arrow.up.doc.fill" size={16} color="#FFFFFF" />
                <Text style={styles.primaryActionBtnText}>Upload Requirements</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { borderColor: colors.border }]}
                onPress={handleNavigateToTracking}
                activeOpacity={0.8}>
                <IconSymbol name="magnifyingglass" size={16} color={colors.accent} />
                <Text style={[styles.secondaryActionBtnText, { color: colors.accent }]}>
                  Track Application
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tertiaryActionBtn}
                onPress={handleNavigateToApplications}
                activeOpacity={0.7}>
                <Text style={[styles.tertiaryActionBtnText, { color: colors.textMuted }]}>
                  View in My Applications
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  typeList: {
    gap: 10,
  },
  typeCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  typeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitleCol: {
    flex: 1,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeDept: {
    fontSize: 11,
    marginTop: 1,
  },
  typeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  disabledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  disabledBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  requiredStar: {
    color: '#EF4444',
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  presetScroll: {
    marginTop: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  presetChipText: {
    fontSize: 11,
  },
  ownershipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ownershipChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  ownershipChipText: {
    fontSize: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    marginTop: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  appDetailsBox: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 6,
    marginVertical: 4,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    width: '100%',
    gap: 8,
    marginTop: 6,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tertiaryActionBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tertiaryActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
