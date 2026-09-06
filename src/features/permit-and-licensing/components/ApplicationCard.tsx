import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitApplication } from '../types/permit.types';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: PermitApplication;
  onPress: (application: PermitApplication) => void;
}

export function ApplicationCard({ application, onPress }: ApplicationCardProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const appNo = application.application_no || `ID #${application.permit_id || application.id || 'N/A'}`;
  const permitType = application.permit_type || application.type || 'Permit Application';
  const businessName = application.business_name || application.owner_name;
  const status = application.status || application.current_status || 'submitted';
  const dateString = application.created_at || application.date_applied;

  let formattedDate: string | null = null;
  if (dateString) {
    try {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      formattedDate = dateString;
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(application)}
      activeOpacity={0.75}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.permitType, { color: colors.textPrimary }]} numberOfLines={1}>
            {permitType}
          </Text>
          <Text style={[styles.appNo, { color: colors.textMuted }]}>
            {appNo}
          </Text>
        </View>
        <StatusBadge status={status} size="small" />
      </View>

      {businessName ? (
        <View style={styles.businessRow}>
          <IconSymbol name="building.2.fill" size={14} color={colors.textSecondary} />
          <Text style={[styles.businessText, { color: colors.textSecondary }]} numberOfLines={1}>
            {businessName}
          </Text>
        </View>
      ) : null}

      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <View style={styles.dateContainer}>
          {formattedDate ? (
            <>
              <IconSymbol name="calendar" size={13} color={colors.textMuted} />
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {formattedDate}
              </Text>
            </>
          ) : (
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              Active Application
            </Text>
          )}
        </View>

        <View style={styles.actionPrompt}>
          <Text style={[styles.viewDetailsText, { color: colors.accent }]}>
            View Details
          </Text>
          <IconSymbol name="chevron.right" size={14} color={colors.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  titleContainer: {
    flex: 1,
  },
  permitType: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  appNo: {
    fontSize: 13,
    fontWeight: '500',
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  businessText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
