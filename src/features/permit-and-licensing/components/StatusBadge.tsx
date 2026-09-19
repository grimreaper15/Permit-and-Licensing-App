import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitApplicationStatus } from '../types/permit.types';

interface StatusBadgeProps {
  status: PermitApplicationStatus | string | undefined | null;
  size?: 'small' | 'medium';
}

function formatStatusLabel(statusStr: string): string {
  if (!statusStr) return 'Unknown';
  
  const normalized = statusStr.toLowerCase().trim();
  switch (normalized) {
    case 'submitted':
      return 'Submitted';
    case 'under_review':
      return 'Under Review';
    case 'document_screening':
      return 'Document Screening';
    case 'pending_requirements':
      return 'Pending Requirements';
    case 'needs_action':
      return 'Action Required';
    case 'inspection_pending':
      return 'Inspection Scheduled';
    case 'inspection_passed':
      return 'Inspection Passed';
    case 'fee_assessment':
    case 'assessment':
      return 'Fee Assessment';
    case 'pending_payment':
      return 'Pending Payment';
    case 'payment_verified':
      return 'Payment Verified';
    case 'final_approval':
      return 'Final Approval';
    case 'approved':
      return 'Approved';
    case 'verified':
      return 'Verified';
    case 'issued':
      return 'Permit Issued';
    case 'ready_for_release':
      return 'Ready For Release';
    case 'pending':
      return 'Pending';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    default:
      // Graceful fallback for unknown server statuses: format snake_case/kebab-case safely
      return statusStr
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const rawStatus = (status || 'unknown').toLowerCase().trim();
  const label = formatStatusLabel(status || 'unknown');

  let badgeBg = isDarkMode ? '#1E293B' : '#F1F5F9';
  let badgeText = isDarkMode ? '#94A3B8' : '#64748B';
  let borderColor = isDarkMode ? '#334155' : '#CBD5E1';

  if (['approved', 'issued', 'payment_verified', 'inspection_passed', 'ready_for_release', 'verified'].includes(rawStatus)) {
    badgeBg = colors.successLight;
    badgeText = colors.success;
    borderColor = isDarkMode ? '#065F46' : '#BBF7D0';
  } else if (['under_review', 'document_screening', 'pending_requirements', 'needs_action', 'fee_assessment', 'assessment', 'pending_payment', 'pending'].includes(rawStatus)) {
    badgeBg = colors.warningLight;
    badgeText = colors.warning;
    borderColor = isDarkMode ? '#854D0E' : '#FDE68A';
  } else if (['rejected', 'cancelled'].includes(rawStatus)) {
    badgeBg = colors.dangerLight;
    badgeText = colors.danger;
    borderColor = isDarkMode ? '#991B1B' : '#FECACA';
  } else if (['submitted', 'draft'].includes(rawStatus)) {
    badgeBg = colors.infoLight;
    badgeText = colors.info;
    borderColor = isDarkMode ? '#0369A1' : '#BAE6FD';
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeBg,
          borderColor,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 6,
        },
      ]}>
      <Text
        style={[
          styles.badgeText,
          {
            color: badgeText,
            fontSize: isSmall ? 11 : 13,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
