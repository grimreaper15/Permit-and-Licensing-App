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
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { correctDeclaration } from '../api/permitApi';
import { PERMIT_COLORS } from '../styles/permit.styles';
import {
  ApplicationTransactionType,
  CitizenDeclarationFields,
  OwnershipType,
  PermitCorrectionPayload,
} from '../types/permit.types';

interface DeclarationCorrectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  applicationNo: string;
  permitId?: number | string;
  initialFields?: CitizenDeclarationFields;
}

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

export function DeclarationCorrectionModal({
  visible,
  onClose,
  onSuccess,
  applicationNo,
  permitId,
  initialFields,
}: DeclarationCorrectionModalProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const [appType, setAppType] = useState<ApplicationTransactionType>(
    (initialFields?.application_type as ApplicationTransactionType) === 'Renewal' ? 'Renewal' : 'New'
  );
  const [lineOfBusiness, setLineOfBusiness] = useState(initialFields?.line_of_business || 'General Merchandise');
  const [capitalInvestment, setCapitalInvestment] = useState(String(initialFields?.capital_investment ?? 0));
  const [grossSales, setGrossSales] = useState(String(initialFields?.gross_sales ?? 0));
  const [floorArea, setFloorArea] = useState(String(initialFields?.floor_area_sqm ?? 0));
  const [employees, setEmployees] = useState(String(initialFields?.number_of_employees ?? 1));
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(
    (initialFields?.ownership_type as OwnershipType) || 'Sole Proprietorship'
  );
  const [isFoodHandling, setIsFoodHandling] = useState(Boolean(initialFields?.is_food_handling));
  const [hasHazardousWaste, setHasHazardousWaste] = useState(Boolean(initialFields?.has_hazardous_waste));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!lineOfBusiness.trim()) {
      return 'Line of Business cannot be empty.';
    }
    const cap = parseFloat(capitalInvestment);
    if (isNaN(cap) || cap < 0) {
      return 'Capital Investment must be a valid non-negative amount.';
    }
    const gross = parseFloat(grossSales);
    if (isNaN(gross) || gross < 0) {
      return 'Gross Sales must be a valid non-negative amount.';
    }
    const area = parseFloat(floorArea);
    if (isNaN(area) || area < 0) {
      return 'Floor Area must be a valid non-negative number.';
    }
    const emp = parseInt(employees, 10);
    if (isNaN(emp) || emp < 1) {
      return 'Number of Employees must be at least 1.';
    }
    return null;
  };

  const handleSaveCorrection = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: PermitCorrectionPayload = {
        application_no: applicationNo,
        permit_id: permitId,
        application_type: appType,
        line_of_business: lineOfBusiness.trim(),
        capital_investment: Math.max(0, parseFloat(capitalInvestment) || 0),
        gross_sales: Math.max(0, parseFloat(grossSales) || 0),
        number_of_employees: Math.max(1, parseInt(employees, 10) || 1),
        floor_area_sqm: Math.max(0, parseFloat(floorArea) || 0),
        ownership_type: ownershipType,
        is_food_handling: Boolean(isFoodHandling),
        has_hazardous_waste: Boolean(hasHazardousWaste),
      };

      const res = await correctDeclaration(payload);
      if (res.success || res.status === 'success') {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to submit declaration correction.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while submitting declaration correction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.modalHeaderTitleCol}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Review / Correct Declaration
              </Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                Application #{applicationNo}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <IconSymbol name="xmark" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Explanatory Info Card */}
            <View
              style={[
                styles.infoNotice,
                { backgroundColor: isDarkMode ? '#0F2942' : '#F0F9FF', borderColor: colors.accent },
              ]}>
              <IconSymbol name="info.circle.fill" size={16} color={colors.accent} />
              <Text style={[styles.infoNoticeText, { color: colors.textPrimary }]}>
                You are updating your citizen-declared business parameters. Administrative statuses, reviewer notes, and fee totals cannot be modified.
              </Text>
            </View>

            {/* Application Transaction */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Application Transaction
              </Text>
              <View style={styles.transRow}>
                <TouchableOpacity
                  style={[
                    styles.transCard,
                    {
                      backgroundColor:
                        appType === 'New'
                          ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                          : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                      borderColor: appType === 'New' ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setAppType('New')}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.transText,
                      { color: appType === 'New' ? colors.accent : colors.textPrimary },
                    ]}>
                    New Application
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.transCard,
                    {
                      backgroundColor:
                        appType === 'Renewal'
                          ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                          : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                      borderColor: appType === 'Renewal' ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setAppType('Renewal')}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.transText,
                      { color: appType === 'Renewal' ? colors.accent : colors.textPrimary },
                    ]}>
                    Renewal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Line of Business */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Line of Business
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
                value={lineOfBusiness}
                onChangeText={setLineOfBusiness}
                placeholder="e.g. Retail Merchandising"
                placeholderTextColor={colors.textMuted}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                {LINE_OF_BUSINESS_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor:
                          lineOfBusiness === preset
                            ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                            : (isDarkMode ? '#1E293B' : '#F1F5F9'),
                        borderColor: lineOfBusiness === preset ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setLineOfBusiness(preset)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.presetChipText,
                        {
                          color: lineOfBusiness === preset ? colors.accent : colors.textSecondary,
                          fontWeight: lineOfBusiness === preset ? '700' : '500',
                        },
                      ]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Ownership Type */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Legal Ownership Type
              </Text>
              <View style={styles.ownershipRow}>
                {OWNERSHIP_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.ownershipChip,
                      {
                        backgroundColor:
                          ownershipType === opt
                            ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                            : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                        borderColor: ownershipType === opt ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setOwnershipType(opt)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.ownershipChipText,
                        {
                          color: ownershipType === opt ? colors.accent : colors.textSecondary,
                          fontWeight: ownershipType === opt ? '700' : '500',
                        },
                      ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Food Handling & Hazardous Waste Declarations */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Food Handling Establishment
              </Text>
              <Text style={[styles.fieldDesc, { color: colors.textMuted }]}>
                Does your business prepare, process, serve, or handle food?
              </Text>
              <View style={styles.boolRow}>
                <TouchableOpacity
                  style={[
                    styles.boolBtn,
                    {
                      backgroundColor: isFoodHandling
                        ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                        : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                      borderColor: isFoodHandling ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setIsFoodHandling(true)}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.boolBtnText,
                      {
                        color: isFoodHandling ? colors.accent : colors.textSecondary,
                        fontWeight: isFoodHandling ? '700' : '500',
                      },
                    ]}>
                    Yes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.boolBtn,
                    {
                      backgroundColor: !isFoodHandling
                        ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                        : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                      borderColor: !isFoodHandling ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setIsFoodHandling(false)}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.boolBtnText,
                      {
                        color: !isFoodHandling ? colors.accent : colors.textSecondary,
                        fontWeight: !isFoodHandling ? '700' : '500',
                      },
                    ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Hazardous / Industrial Waste
              </Text>
              <Text style={[styles.fieldDesc, { color: colors.textMuted }]}>
                Does your business generate or handle hazardous/industrial waste?
              </Text>
              <View style={styles.boolRow}>
                <TouchableOpacity
                  style={[
                    styles.boolBtn,
                    {
                      backgroundColor: hasHazardousWaste
                        ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                        : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                      borderColor: hasHazardousWaste ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setHasHazardousWaste(true)}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.boolBtnText,
                      {
                        color: hasHazardousWaste ? colors.accent : colors.textSecondary,
                        fontWeight: hasHazardousWaste ? '700' : '500',
                      },
                    ]}>
                    Yes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.boolBtn,
                    {
                      backgroundColor: !hasHazardousWaste
                        ? (isDarkMode ? '#0369A1' : '#E0F2FE')
                        : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                      borderColor: !hasHazardousWaste ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setHasHazardousWaste(false)}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.boolBtnText,
                      {
                        color: !hasHazardousWaste ? colors.accent : colors.textSecondary,
                        fontWeight: !hasHazardousWaste ? '700' : '500',
                      },
                    ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Financial Scale Inputs */}
            <View style={styles.twoCol}>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
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
                  value={capitalInvestment}
                  onChangeText={setCapitalInvestment}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
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
                  value={grossSales}
                  onChangeText={setGrossSales}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Physical Scale Inputs */}
            <View style={styles.twoCol}>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
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
                  value={employees}
                  onChangeText={setEmployees}
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
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
                  value={floorArea}
                  onChangeText={setFloorArea}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerLight }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={handleSaveCorrection}
                disabled={isSubmitting}
                activeOpacity={0.85}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol name="arrow.triangle.2.circlepath" size={16} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Resubmit Corrected Declaration</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  modalHeaderTitleCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 18,
    gap: 14,
    paddingBottom: 40,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoNoticeText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  fieldDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  transRow: {
    flexDirection: 'row',
    gap: 10,
  },
  transCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  transText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '500',
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
  ownershipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ownershipChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  ownershipChipText: {
    fontSize: 11,
  },
  boolRow: {
    flexDirection: 'row',
    gap: 10,
  },
  boolBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boolBtnText: {
    fontSize: 12,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  modalActions: {
    gap: 8,
    marginTop: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
