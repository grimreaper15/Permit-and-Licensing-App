import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitDeficiency } from '../types/permit.types';

interface DeficiencyBannerProps {
  deficiencies?: PermitDeficiency[] | null;
}

export function DeficiencyBanner({ deficiencies }: DeficiencyBannerProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  if (!deficiencies || deficiencies.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.warningLight,
          borderColor: isDarkMode ? '#854D0E' : '#FDE68A',
        },
      ]}>
      <View style={styles.headerRow}>
        <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
        <Text style={[styles.headerTitle, { color: colors.warning }]}>
          Action Required ({deficiencies.length} Item{deficiencies.length > 1 ? 's' : ''})
        </Text>
      </View>

      <View style={styles.list}>
        {deficiencies.map((item, index) => {
          const title = item.title || item.type || `Requirement #${index + 1}`;
          return (
            <View key={item.deficiency_id || index} style={styles.deficiencyItem}>
              <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                • {title}
              </Text>
              {item.description ? (
                <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    gap: 8,
    marginTop: 4,
  },
  deficiencyItem: {
    paddingLeft: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 12,
  },
});
