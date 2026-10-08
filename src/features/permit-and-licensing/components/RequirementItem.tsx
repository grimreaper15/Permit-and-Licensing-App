import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitDocumentSummary, PermitRequirementItem } from '../types/permit.types';
import { ScreeningBadge } from './ScreeningBadge';
import { StatusBadge } from './StatusBadge';

interface RequirementItemProps {
  document?: PermitDocumentSummary;
  item?: PermitRequirementItem;
  onUploadOrReplace?: (target: any) => void;
  isUploading?: boolean;
}

export const RequirementItem: React.FC<RequirementItemProps> = ({
  document,
  item,
  onUploadOrReplace,
  isUploading = false,
}) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  // Determine authoritative values from item if available, otherwise document
  const docName = item ? item.name : (document?.document_name || document?.name || 'Permit Requirement');
  const rawStatus = (item ? (item.document_status || '') : (document?.status || '')).toLowerCase().trim();
  const isVerified = rawStatus === 'verified' || rawStatus === 'approved';
  const isRejected = rawStatus === 'rejected';
  const isUploaded = item ? item.uploaded : (!!document?.uploaded_at || isVerified || rawStatus === 'pending' || document?.status === 'Approved' || document?.status === 'Pending');
  const uploadedAtStr = item?.uploaded_at || document?.uploaded_at;
  const ruleBadge = item?.rule_badge;

  let formattedDate: string | null = null;
  if (uploadedAtStr) {
    try {
      const d = new Date(uploadedAtStr);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = uploadedAtStr;
    }
  }

  const handleAction = () => {
    if (onUploadOrReplace) {
      onUploadOrReplace(item || document);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isRejected
            ? colors.danger
            : isUploaded
            ? (isVerified ? colors.success : colors.border)
            : colors.danger,
        },
      ]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isVerified
                ? colors.successLight
                : isRejected
                ? colors.dangerLight
                : isUploaded
                ? colors.successLight
                : colors.dangerLight,
            },
          ]}>
          <IconSymbol
            name={
              isVerified
                ? 'checkmark.circle.fill'
                : isRejected
                ? 'exclamationmark.triangle.fill'
                : isUploaded
                ? 'checkmark.circle.fill'
                : 'xmark.circle.fill'
            }
            size={18}
            color={
              isVerified
                ? colors.success
                : isRejected
                ? colors.danger
                : isUploaded
                ? colors.success
                : colors.danger
            }
          />
        </View>
        <View style={styles.contentCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.docName, { color: colors.textPrimary }]}>{docName}</Text>
          </View>

          {ruleBadge ? (
            <View style={styles.ruleBadgeRow}>
              <View style={[styles.ruleBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
                <Text style={[styles.ruleBadgeText, { color: colors.textSecondary }]}>{ruleBadge}</Text>
              </View>
            </View>
          ) : null}

          {/* Status badge if explicit status exists */}
          {(item?.document_status || document?.status) ? (
            <View style={styles.statusRow}>
              <StatusBadge status={item?.document_status || document?.status} size="small" />
            </View>
          ) : null}

          {isUploaded ? (
            formattedDate ? (
              <Text style={[styles.uploadDateText, { color: colors.textMuted }]}>
                Uploaded: {formattedDate}
              </Text>
            ) : (
              <Text style={[styles.uploadDateText, { color: colors.success }]}>
                ✓ Uploaded
              </Text>
            )
          ) : (
            <Text style={[styles.uploadDateText, { color: colors.danger, fontWeight: '600' }]}>
              ✕ Missing — Tap to Upload
            </Text>
          )}
        </View>

        {onUploadOrReplace ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isRejected
                  ? colors.danger
                  : isUploaded
                  ? (isDarkMode ? '#1E293B' : '#E0F2FE')
                  : colors.accent,
              },
            ]}
            onPress={handleAction}
            disabled={isUploading}
            activeOpacity={0.8}>
            <IconSymbol
              name={isRejected ? 'arrow.clockwise' : isUploaded ? 'arrow.triangle.2.circlepath' : 'arrow.up.doc.fill'}
              size={13}
              color={isRejected ? '#FFFFFF' : isUploaded ? colors.accent : '#FFFFFF'}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: isRejected ? '#FFFFFF' : isUploaded ? colors.accent : '#FFFFFF' },
              ]}>
              {isRejected ? 'Resubmit' : isUploaded ? 'Replace' : 'Upload'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Screening Badge or Status */}
      {isUploaded && (document?.screening_status) ? (
        <View style={styles.screeningRow}>
          <Text style={[styles.screeningLabel, { color: colors.textSecondary }]}>AI Screening:</Text>
          <ScreeningBadge status={document.screening_status} compact />
        </View>
      ) : null}

      {/* Rejection Note if marked deficient */}
      {isRejected && (document?.rejection_reason) ? (
        <View style={[styles.rejectionBox, { backgroundColor: colors.dangerLight }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={13} color={colors.danger} />
          <Text style={[styles.rejectionText, { color: colors.danger }]}>
            {document.rejection_reason}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
  },
  ruleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ruleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  ruleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  uploadDateText: {
    fontSize: 11,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  screeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  screeningLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rejectionText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
});

