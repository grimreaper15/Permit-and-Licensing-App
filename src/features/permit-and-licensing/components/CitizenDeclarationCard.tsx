import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { CitizenDeclarationSummary } from '../types/permit.types';

interface CitizenDeclarationCardProps {
  declaration?: CitizenDeclarationSummary;
  applicationNo: string;
  onPressCorrect?: () => void;
}

export function CitizenDeclarationCard({
  declaration,
  applicationNo,
  onPressCorrect,
}: CitizenDeclarationCardProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  if (!declaration || !declaration.fields) {
    return null;
  }

  const status = declaration.status || 'Pending Review';
  const fields = declaration.fields;
  const isNeedsCorrection = status === 'Needs Correction';
  const isRejected = status === 'Rejected';
  const isVerified = status === 'Verified';

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0;
    return '₱' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isVerified
                  ? colors.successLight
                  : isNeedsCorrection
                  ? colors.warningLight
                  : isRejected
                  ? colors.dangerLight
                  : isDarkMode
                  ? '#1E293B'
                  : '#F1F5F9',
              },
            ]}>
            <IconSymbol
              name={
                isVerified
                  ? 'checkmark.seal.fill'
                  : isNeedsCorrection
                  ? 'exclamationmark.triangle.fill'
                  : isRejected
                  ? 'xmark.circle.fill'
                  : 'doc.text.fill'
              }
              size={18}
              color={
                isVerified
                  ? colors.success
                  : isNeedsCorrection
                  ? colors.warning
                  : isRejected
                  ? colors.danger
                  : colors.accent
              }
            />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Citizen Business Declaration
            </Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              Authoritative statutory business parameters
            </Text>
          </View>
        </View>

        {/* Declaration Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isVerified
                ? (isDarkMode ? '#064E3B' : '#DCFCE7')
                : isNeedsCorrection
                ? (isDarkMode ? '#78350F' : '#FEF3C7')
                : isRejected
                ? (isDarkMode ? '#7F1D1D' : '#FEE2E2')
                : (isDarkMode ? '#1E293B' : '#FEF3C7'),
              borderColor: isVerified
                ? colors.success
                : isNeedsCorrection
                ? colors.warning
                : isRejected
                ? colors.danger
                : colors.warning,
            },
          ]}>
          <Text
            style={[
              styles.statusBadgeText,
              {
                color: isVerified
                  ? colors.success
                  : isNeedsCorrection
                  ? colors.warning
                  : isRejected
                  ? colors.danger
                  : colors.warning,
              },
            ]}>
            {status}
          </Text>
        </View>
      </View>

      {/* Prominent Correction Request Alert Banner */}
      {isNeedsCorrection ? (
        <View
          style={[
            styles.correctionAlertBox,
            {
              backgroundColor: isDarkMode ? '#451A03' : '#FFFBEB',
              borderColor: isDarkMode ? '#B45309' : '#FCD34D',
            },
          ]}>
          <View style={styles.alertHeaderRow}>
            <IconSymbol name="exclamationmark.circle.fill" size={16} color={colors.warning} />
            <Text style={[styles.alertTitle, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
              Municipal Assessor Requested Correction
            </Text>
          </View>

          {declaration.review_notes ? (
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: isDarkMode ? '#FCD34D' : '#78350F' }]}>
                Reason / Instructions:
              </Text>
              <Text style={[styles.notesText, { color: isDarkMode ? '#FEF3C7' : '#92400E' }]}>
                "{declaration.review_notes}"
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.correctBtn, { backgroundColor: colors.warning }]}
            onPress={onPressCorrect}
            activeOpacity={0.85}>
            <IconSymbol name="pencil" size={14} color="#FFFFFF" />
            <Text style={styles.correctBtnText}>Review / Correct Declaration</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Rejection Alert Banner */}
      {isRejected ? (
        <View
          style={[
            styles.correctionAlertBox,
            {
              backgroundColor: isDarkMode ? '#450A0A' : '#FEF2F2',
              borderColor: isDarkMode ? '#991B1B' : '#FECACA',
            },
          ]}>
          <View style={styles.alertHeaderRow}>
            <IconSymbol name="xmark.octagon.fill" size={16} color={colors.danger} />
            <Text style={[styles.alertTitle, { color: isDarkMode ? '#FECACA' : '#991B1B' }]}>
              Declaration Disapproved by Assessor
            </Text>
          </View>
          {declaration.review_notes ? (
            <Text style={[styles.notesText, { color: isDarkMode ? '#FEE2E2' : '#7F1D1D' }]}>
              Reason: {declaration.review_notes}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Verified Notice */}
      {isVerified && declaration.verified_at ? (
        <View style={styles.verifiedNoticeRow}>
          <IconSymbol name="checkmark.circle.fill" size={13} color={colors.success} />
          <Text style={[styles.verifiedNoticeText, { color: colors.success }]}>
            Declaration verified by Municipal Assessor on {declaration.verified_at}
          </Text>
        </View>
      ) : null}

      {/* Declared Business Facts Grid */}
      <View
        style={[
          styles.factsGrid,
          {
            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Transaction:</Text>
          <Text style={[styles.factValue, { color: colors.textPrimary }]}>
            {fields.application_type || 'New'} Application
          </Text>
        </View>

        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Line of Business:</Text>
          <Text style={[styles.factValue, { color: colors.textPrimary }]}>
            {fields.line_of_business}
          </Text>
        </View>

        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Capital Investment:</Text>
          <Text style={[styles.factValue, { color: colors.textPrimary }]}>
            {formatCurrency(fields.capital_investment)}
          </Text>
        </View>

        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Gross Sales:</Text>
          <Text style={[styles.factValue, { color: colors.textPrimary }]}>
            {formatCurrency(fields.gross_sales)}
          </Text>
        </View>

        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Total Floor Area:</Text>
          <Text style={[styles.factValue, { color: colors.textPrimary }]}>
            {fields.floor_area_sqm} sq.m.
          </Text>
        </View>

        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Employees:</Text>
          <Text style={[styles.factValue, { color: colors.textPrimary }]}>
            {fields.number_of_employees} staff
          </Text>
        </View>

        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Food Handling:</Text>
          <Text
            style={[
              styles.factValue,
              { color: fields.is_food_handling ? colors.warning : colors.textPrimary },
            ]}>
            {fields.is_food_handling ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.factRow}>
          <Text style={[styles.factLabel, { color: colors.textMuted }]}>Hazardous Waste:</Text>
          <Text
            style={[
              styles.factValue,
              { color: fields.has_hazardous_waste ? colors.danger : colors.textPrimary },
            ]}>
            {fields.has_hazardous_waste ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  correctionAlertBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  notesContainer: {
    gap: 2,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  correctBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  correctBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedNoticeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  factsGrid: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  factValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});
