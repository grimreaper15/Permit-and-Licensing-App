import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitTimelineStage } from '../types/permit.types';

interface TimelineViewProps {
  stages?: PermitTimelineStage[];
}

export function TimelineView({ stages = [] }: TimelineViewProps) {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  if (!stages || stages.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="doc.text.fill" size={24} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Timeline information is not yet available for this application.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        const rawStatus = (stage.status || 'pending').toLowerCase().trim();
        const stageName = stage.stage || stage.stage_name || stage.name || stage.title || `Stage ${index + 1}`;
        const description = stage.description || stage.remarks;
        const timestamp = stage.timestamp || stage.updated_at;

        let iconName: any = 'circle.fill';
        let iconColor = colors.textMuted;
        let nodeBg = isDarkMode ? '#1E293B' : '#E2E8F0';
        let nodeBorder = isDarkMode ? '#334155' : '#CBD5E1';
        let statusBadgeText = 'Pending';
        let statusBadgeColor = colors.textMuted;

        if (rawStatus === 'completed' || rawStatus === 'ready_for_release') {
          iconName = 'checkmark.circle.fill';
          iconColor = colors.success;
          nodeBg = colors.successLight;
          nodeBorder = colors.success;
          statusBadgeText = 'Completed';
          statusBadgeColor = colors.success;
        } else if (rawStatus === 'current') {
          iconName = 'arrow.triangle.2.circlepath';
          iconColor = colors.accent;
          nodeBg = colors.infoLight;
          nodeBorder = colors.accent;
          statusBadgeText = 'In Progress';
          statusBadgeColor = colors.accent;
        } else if (rawStatus === 'needs_action') {
          iconName = 'exclamationmark.triangle.fill';
          iconColor = colors.warning;
          nodeBg = colors.warningLight;
          nodeBorder = colors.warning;
          statusBadgeText = 'Action Needed';
          statusBadgeColor = colors.warning;
        } else if (rawStatus === 'rejected') {
          iconName = 'exclamationmark.triangle.fill';
          iconColor = colors.danger;
          nodeBg = colors.dangerLight;
          nodeBorder = colors.danger;
          statusBadgeText = 'Rejected';
          statusBadgeColor = colors.danger;
        } else {
          // Graceful handling for other/unknown statuses
          statusBadgeText = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
        }

        let formattedTime: string | null = null;
        if (timestamp) {
          try {
            const d = new Date(timestamp);
            if (!isNaN(d.getTime())) {
              formattedTime = d.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            }
          } catch {
            formattedTime = timestamp;
          }
        }

        return (
          <View key={stage.stage_id || index} style={styles.stageRow}>
            {/* Left Node and Connecting Line */}
            <View style={styles.nodeColumn}>
              <View
                style={[
                  styles.nodeCircle,
                  {
                    backgroundColor: nodeBg,
                    borderColor: nodeBorder,
                  },
                ]}>
                <IconSymbol name={iconName} size={16} color={iconColor} />
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.connectingLine,
                    {
                      backgroundColor:
                        rawStatus === 'completed' ? colors.success : isDarkMode ? '#334155' : '#E2E8F0',
                    },
                  ]}
                />
              ) : null}
            </View>

            {/* Right Stage Content */}
            <View style={[styles.contentColumn, !isLast && styles.contentColumnSpacing]}>
              <View style={styles.stageHeader}>
                <Text style={[styles.stageTitle, { color: colors.textPrimary }]}>
                  {stageName}
                </Text>
                <View
                  style={[
                    styles.miniBadge,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                      borderColor: nodeBorder,
                    },
                  ]}>
                  <Text style={[styles.miniBadgeText, { color: statusBadgeColor }]}>
                    {statusBadgeText}
                  </Text>
                </View>
              </View>

              {formattedTime ? (
                <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                  {formattedTime}
                </Text>
              ) : null}

              {description ? (
                <Text style={[styles.descText, { color: colors.textSecondary }]}>
                  {description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginVertical: 4,
    zIndex: 1,
  },
  contentColumn: {
    flex: 1,
    paddingTop: 2,
  },
  contentColumnSpacing: {
    paddingBottom: 24,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  stageTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timestampText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
