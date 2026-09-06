import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitPaymentSummary } from '../types/permit.types';

interface PaymentSummaryCardProps {
  payment?: PermitPaymentSummary | null;
}

export function PaymentSummaryCard({ payment }: PaymentSummaryCardProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  if (!payment) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.iconTitleRow}>
            <IconSymbol name="creditcard.fill" size={18} color={colors.textSecondary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Fee Assessment & Payment</Text>
          </View>
        </View>
        <Text style={[styles.notAssessedText, { color: colors.textMuted }]}>
          Fee assessment is currently pending official review.
        </Text>
      </View>
    );
  }

  const totalAmountNum = typeof payment.total_amount === 'number'
    ? payment.total_amount
    : parseFloat(String(payment.total_amount || 0));

  const totalPaidNum = typeof payment.total_paid === 'number'
    ? payment.total_paid
    : parseFloat(String(payment.total_paid || 0));

  const calculatedBalance = Math.max(0, totalAmountNum - totalPaidNum);
  const isPaid = payment.is_paid === true || (totalAmountNum > 0 && calculatedBalance <= 0);
  const paymentStatus = payment.payment_status?.toLowerCase() || (isPaid ? 'verified' : 'unpaid');

  let statusBadgeBg = colors.warningLight;
  let statusBadgeText = colors.warning;
  let statusLabel = 'UNPAID';

  if (isPaid || paymentStatus === 'verified' || paymentStatus === 'paid') {
    statusBadgeBg = colors.successLight;
    statusBadgeText = colors.success;
    statusLabel = 'PAYMENT VERIFIED';
  } else if (paymentStatus === 'pending') {
    statusBadgeBg = colors.infoLight;
    statusBadgeText = colors.info;
    statusLabel = 'PAYMENT PROCESSING';
  } else if (paymentStatus === 'failed') {
    statusBadgeBg = colors.dangerLight;
    statusBadgeText = colors.danger;
    statusLabel = 'PAYMENT FAILED';
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconTitleRow}>
          <IconSymbol name="creditcard.fill" size={18} color={colors.accent} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Payment Assessment</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBadgeBg }]}>
          <Text style={[styles.statusBadgeText, { color: statusBadgeText }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Fee Breakdown Items if available */}
      {payment.fees && payment.fees.length > 0 ? (
        <View style={[styles.feeList, { borderBottomColor: colors.border }]}>
          {payment.fees.map((fee, idx) => {
            const feeAmt = typeof fee.amount === 'number'
              ? fee.amount
              : parseFloat(String(fee.amount || 0));
            return (
              <View key={idx} style={styles.feeItemRow}>
                <Text style={[styles.feeItemName, { color: colors.textSecondary }]}>
                  {fee.fee_name || fee.name || `Fee #${idx + 1}`}
                </Text>
                <Text style={[styles.feeItemAmount, { color: colors.textPrimary }]}>
                  ₱{isNaN(feeAmt) ? '0.00' : feeAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Totals Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Assessment</Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            ₱{isNaN(totalAmountNum) ? '0.00' : totalAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Paid</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            ₱{isNaN(totalPaidNum) ? '0.00' : totalPaidNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={[styles.summaryRow, styles.balanceRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.balanceLabel, { color: colors.textPrimary }]}>Remaining Balance</Text>
          <Text
            style={[
              styles.balanceValue,
              { color: calculatedBalance > 0 ? colors.danger : colors.success },
            ]}>
            ₱{calculatedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Official Receipt / Notice */}
      {payment.or_number ? (
        <View style={[styles.receiptBox, { backgroundColor: isDarkMode ? '#0F2942' : '#F0F9FF' }]}>
          <IconSymbol name="checkmark.seal.fill" size={14} color={colors.accent} />
          <Text style={[styles.receiptText, { color: colors.accent }]}>
            Official Receipt: {payment.or_number}
          </Text>
        </View>
      ) : (
        <View style={[styles.noticeBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={14} color={colors.textMuted} />
          <Text style={[styles.noticeText, { color: colors.textMuted }]}>
            {isPaid
              ? 'Payment verified by City Treasury. Eligible for Permit release.'
              : 'Payment verification required before final permit issuance.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  notAssessedText: {
    fontSize: 13,
    lineHeight: 18,
  },
  feeList: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  feeItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  feeItemName: {
    fontSize: 13,
  },
  feeItemAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryContainer: {
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  balanceRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  receiptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  receiptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  noticeText: {
    fontSize: 11,
    flex: 1,
  },
});
