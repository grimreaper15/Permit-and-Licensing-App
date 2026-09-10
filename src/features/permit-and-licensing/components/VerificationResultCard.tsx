import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitVerificationResult, TproVerificationResult } from '../types/permit.types';
import { PermitVerificationBadge } from './PermitVerificationBadge';

interface VerificationResultCardProps {
  bploResult?: PermitVerificationResult | null;
  tproResult?: TproVerificationResult | null;
  mode: 'BPLO' | 'TPRO';
}

export function VerificationResultCard({ bploResult, tproResult, mode }: VerificationResultCardProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  if (mode === 'BPLO' && bploResult) {
    const isValid = bploResult.valid;
    const status = bploResult.verification_status;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isValid ? (isDarkMode ? '#059669' : '#10B981') : colors.border,
          },
        ]}>
        <View style={styles.headerRow}>
          <View style={styles.badgeWrapper}>
            <PermitVerificationBadge status={status} size="large" />
          </View>
          <Text style={[styles.modeIndicator, { color: colors.textMuted }]}>BPLO Verification</Text>
        </View>

        {bploResult.verification_message ? (
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: isValid
                  ? isDarkMode ? '#064E3B20' : '#ECFDF5'
                  : isDarkMode ? '#7F1D1D20' : '#FEF2F2',
                borderColor: isValid
                  ? isDarkMode ? '#05966950' : '#A7F3D0'
                  : isDarkMode ? '#DC262650' : '#FECACA',
              },
            ]}>
            <IconSymbol
              name={isValid ? 'checkmark.circle.fill' : 'exclamationmark.circle.fill'}
              size={16}
              color={isValid ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.messageText,
                { color: isValid ? (isDarkMode ? '#34D399' : '#059669') : (isDarkMode ? '#F87171' : '#DC2626') },
              ]}>
              {bploResult.verification_message}
            </Text>
          </View>
        ) : null}

        {/* Structured Details Table for Authenticated / Recognized Permits */}
        {(bploResult.permit_number || bploResult.business_name) ? (
          <View style={[styles.detailsTable, { borderTopColor: colors.border }]}>
            {bploResult.permit_number ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Permit Number:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{bploResult.permit_number}</Text>
              </View>
            ) : null}

            {bploResult.business_name ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Business Name:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{bploResult.business_name}</Text>
              </View>
            ) : null}

            {bploResult.permit_type ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Permit Type:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{bploResult.permit_type}</Text>
              </View>
            ) : null}

            {bploResult.issued_at ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Issued Date:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{bploResult.issued_at}</Text>
              </View>
            ) : null}

            {bploResult.status ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Permit Status:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{bploResult.status}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Verified:</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: bploResult.payment_verified ? colors.success : colors.warning },
                ]}>
                {bploResult.payment_verified ? 'Yes (Paid & Cleared)' : 'Unpaid / Pending'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Issuance Status:</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: bploResult.is_issued ? colors.success : colors.warning },
                ]}>
                {bploResult.is_issued ? 'Officially Issued' : 'Not Issued'}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  if (mode === 'TPRO' && tproResult) {
    const isValid = tproResult.valid;
    const isBlocked = tproResult.is_blocked;

    let badgeStatus = 'VALID';
    if (!isValid) badgeStatus = 'INVALID';
    if (isBlocked) badgeStatus = 'BLOCKED';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isValid ? (isDarkMode ? '#059669' : '#10B981') : colors.border,
          },
        ]}>
        <View style={styles.headerRow}>
          <View style={styles.badgeWrapper}>
            <PermitVerificationBadge status={badgeStatus} size="large" />
          </View>
          <Text style={[styles.modeIndicator, { color: colors.textMuted }]}>TPRO Verification</Text>
        </View>

        {tproResult.message ? (
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: isValid && !isBlocked
                  ? isDarkMode ? '#064E3B20' : '#ECFDF5'
                  : isDarkMode ? '#7F1D1D20' : '#FEF2F2',
                borderColor: isValid && !isBlocked
                  ? isDarkMode ? '#05966950' : '#A7F3D0'
                  : isDarkMode ? '#DC262650' : '#FECACA',
              },
            ]}>
            <IconSymbol
              name={isValid && !isBlocked ? 'checkmark.circle.fill' : 'exclamationmark.circle.fill'}
              size={16}
              color={isValid && !isBlocked ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.messageText,
                { color: isValid && !isBlocked ? (isDarkMode ? '#34D399' : '#059669') : (isDarkMode ? '#F87171' : '#DC2626') },
              ]}>
              {tproResult.message}
            </Text>
          </View>
        ) : null}

        {isBlocked && tproResult.block_reason ? (
          <View style={[styles.blockReasonBox, { backgroundColor: isDarkMode ? '#701A7520' : '#FDF4FF', borderColor: isDarkMode ? '#C026D3' : '#F5D0FE' }]}>
            <IconSymbol name="exclamationmark.shield.fill" size={14} color="#C026D3" />
            <Text style={[styles.blockReasonText, { color: isDarkMode ? '#F5D0FE' : '#86198F' }]}>
              Block Reason: {tproResult.block_reason}
            </Text>
          </View>
        ) : null}

        {/* Structured TPRO Transport Fields */}
        {(tproResult.franchise_number || tproResult.operator_name || tproResult.application_no || tproResult.plate_number) ? (
          <View style={[styles.detailsTable, { borderTopColor: colors.border }]}>
            {tproResult.franchise_number ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Franchise / Permit No:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.franchise_number}</Text>
              </View>
            ) : null}

            {tproResult.application_no ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Application No:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.application_no}</Text>
              </View>
            ) : null}

            {tproResult.operator_name ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Operator / Holder:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.operator_name}</Text>
              </View>
            ) : null}

            {tproResult.plate_number ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Plate / Sidecar No:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.plate_number}</Text>
              </View>
            ) : null}

            {tproResult.sticker_number ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sticker No:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.sticker_number}</Text>
              </View>
            ) : null}

            {tproResult.payment_status ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Status:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.payment_status}</Text>
              </View>
            ) : null}

            {typeof tproResult.citations_count === 'number' ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Active Citations:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: tproResult.citations_count > 0 ? colors.danger : colors.success },
                  ]}>
                  {tproResult.citations_count} citation(s)
                </Text>
              </View>
            ) : null}

            {tproResult.issued_at ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date Issued:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.issued_at}</Text>
              </View>
            ) : null}

            {tproResult.valid_until ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Valid Until:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tproResult.valid_until}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeWrapper: {
    flex: 1,
  },
  modeIndicator: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  blockReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  blockReasonText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  detailsTable: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
