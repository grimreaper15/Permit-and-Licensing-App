import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PermitVerificationStatus } from '../types/permit.types';

interface PermitVerificationBadgeProps {
  status: PermitVerificationStatus;
  size?: 'small' | 'medium' | 'large';
}

export function PermitVerificationBadge({ status, size = 'medium' }: PermitVerificationBadgeProps) {
  const { isDarkMode } = useTheme();
  const normalized = (status || '').toUpperCase();

  let bg = isDarkMode ? '#1E293B' : '#F1F5F9';
  let border = isDarkMode ? '#334155' : '#CBD5E1';
  let text = isDarkMode ? '#94A3B8' : '#64748B';
  let iconName: any = 'questionmark.circle.fill';
  let label = normalized || 'UNKNOWN';

  switch (normalized) {
    case 'VALID':
    case 'VALID & ACTIVE':
    case 'ACTIVE':
    case 'ISSUED':
      bg = isDarkMode ? '#064E3B' : '#ECFDF5';
      border = isDarkMode ? '#059669' : '#A7F3D0';
      text = isDarkMode ? '#34D399' : '#059669';
      iconName = 'checkmark.seal.fill';
      label = 'VALID / OFFICIAL';
      break;

    case 'INVALID':
    case 'NOT_FOUND':
      bg = isDarkMode ? '#7F1D1D' : '#FEF2F2';
      border = isDarkMode ? '#DC2626' : '#FECACA';
      text = isDarkMode ? '#F87171' : '#DC2626';
      iconName = 'xmark.octagon.fill';
      label = 'INVALID';
      break;

    case 'RETIRED':
    case 'EXPIRED':
      bg = isDarkMode ? '#451A03' : '#FFFBEB';
      border = isDarkMode ? '#D97706' : '#FDE68A';
      text = isDarkMode ? '#FBBF24' : '#D97706';
      iconName = 'exclamationmark.triangle.fill';
      label = 'RETIRED';
      break;

    case 'NOT_ISSUED':
    case 'PENDING':
      bg = isDarkMode ? '#1E3A8A' : '#EFF6FF';
      border = isDarkMode ? '#2563EB' : '#BFDBFE';
      text = isDarkMode ? '#60A5FA' : '#2563EB';
      iconName = 'clock.fill';
      label = 'NOT ISSUED';
      break;

    case 'BLOCKED':
    case 'SUSPENDED':
      bg = isDarkMode ? '#701A75' : '#FDF4FF';
      border = isDarkMode ? '#C026D3' : '#F5D0FE';
      text = isDarkMode ? '#E879F9' : '#C026D3';
      iconName = 'exclamationmark.shield.fill';
      label = 'BLOCKED / SUSPENDED';
      break;

    case 'UNPAID':
      bg = isDarkMode ? '#431407' : '#FFF7ED';
      border = isDarkMode ? '#EA580C' : '#FED7AA';
      text = isDarkMode ? '#FB923C' : '#EA580C';
      iconName = 'creditcard.fill';
      label = 'UNPAID';
      break;
  }

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingHorizontal: isSmall ? 6 : isLarge ? 12 : 10,
          paddingVertical: isSmall ? 2 : isLarge ? 6 : 4,
        },
      ]}>
      <IconSymbol name={iconName} size={isSmall ? 10 : isLarge ? 16 : 12} color={text} />
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSmall ? 10 : isLarge ? 13 : 11,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
