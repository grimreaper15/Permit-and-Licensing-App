import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';

export type ScreeningBadgeStatus =
  | 'verified'
  | 'needs_review'
  | 'deficient'
  | 'expired'
  | 'unreadable'
  | 'pending'
  | 'manual_review'
  | string;

interface ScreeningBadgeProps {
  status?: string | null;
  qualityScore?: number | null;
  compact?: boolean;
}

export const ScreeningBadge: React.FC<ScreeningBadgeProps> = ({
  status,
  qualityScore,
  compact = false,
}) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const normalized = (status || '').toLowerCase().trim();

  let label = 'Under Review';
  let badgeBg = isDarkMode ? '#1E293B' : '#F1F5F9';
  let textColor = colors.textSecondary;
  let iconName = 'clock.fill';
  let iconColor = colors.textMuted;

  if (
    normalized.includes('verified') ||
    normalized.includes('high confidence') ||
    normalized === 'completed'
  ) {
    label = 'Verified (High Confidence)';
    badgeBg = isDarkMode ? '#064E3B' : '#DCFCE7';
    textColor = isDarkMode ? '#6EE7B7' : '#15803D';
    iconName = 'checkmark.seal.fill';
    iconColor = isDarkMode ? '#6EE7B7' : '#16A34A';
  } else if (
    normalized.includes('discrepancy') ||
    normalized.includes('needs review') ||
    normalized.includes('mismatch')
  ) {
    label = 'Needs Review';
    badgeBg = isDarkMode ? '#451A03' : '#FEF3C7';
    textColor = isDarkMode ? '#FCD34D' : '#B45309';
    iconName = 'exclamationmark.triangle.fill';
    iconColor = isDarkMode ? '#FCD34D' : '#D97706';
  } else if (
    normalized.includes('deficient') ||
    normalized.includes('expired') ||
    normalized.includes('blurry') ||
    normalized.includes('unreadable') ||
    normalized.includes('rejected')
  ) {
    label = normalized.includes('expired')
      ? 'Expired Document'
      : normalized.includes('blurry') || normalized.includes('unreadable')
      ? 'Unreadable / Low Quality'
      : 'Document Deficient';
    badgeBg = isDarkMode ? '#4C0519' : '#FEE2E2';
    textColor = isDarkMode ? '#FDA4AF' : '#B91C1C';
    iconName = 'xmark.octagon.fill';
    iconColor = isDarkMode ? '#FDA4AF' : '#DC2626';
  } else if (normalized.includes('manual') || normalized.includes('skipped')) {
    label = 'Queued for Evaluation';
    badgeBg = isDarkMode ? '#1E293B' : '#E2E8F0';
    textColor = isDarkMode ? '#94A3B8' : '#475569';
    iconName = 'doc.text.magnifyingglass';
    iconColor = isDarkMode ? '#94A3B8' : '#64748B';
  } else if (normalized.includes('pending')) {
    label = 'Screening in Progress';
    badgeBg = isDarkMode ? '#082F49' : '#E0F2FE';
    textColor = isDarkMode ? '#7DD3FC' : '#0369A1';
    iconName = 'arrow.triangle.2.circlepath';
    iconColor = isDarkMode ? '#7DD3FC' : '#0284C7';
  }

  return (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: badgeBg },
        compact && styles.compactContainer,
      ]}>
      <IconSymbol name={iconName as any} size={compact ? 11 : 13} color={iconColor} />
      <Text style={[styles.badgeText, { color: textColor }, compact && styles.compactText]}>
        {label}
      </Text>
      {qualityScore !== undefined && qualityScore !== null && qualityScore > 0 && !compact ? (
        <View style={[styles.scorePill, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
          <Text style={[styles.scoreText, { color: textColor }]}>
            {Math.round(qualityScore)}%
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  compactContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 10,
    fontWeight: '600',
  },
  scorePill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 2,
  },
  scoreText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
