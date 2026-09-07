import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { PermitDocumentSummary } from '../types/permit.types';
import { ScreeningBadge } from './ScreeningBadge';

interface RequirementItemProps {
  document: PermitDocumentSummary;
  onUploadOrReplace?: (document: PermitDocumentSummary) => void;
  isUploading?: boolean;
}

export const RequirementItem: React.FC<RequirementItemProps> = ({
  document,
  onUploadOrReplace,
  isUploading = false,
}) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const docName = document.document_name || document.name || 'Permit Requirement';
  const isUploaded = !!document.uploaded_at || document.status === 'Approved' || document.status === 'Pending';
  const isRejected = document.status === 'Rejected';

  let formattedDate: string | null = null;
  if (document.uploaded_at) {
    try {
      const d = new Date(document.uploaded_at);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = document.uploaded_at;
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: isRejected ? colors.danger : colors.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: isUploaded ? colors.infoLight : (isDarkMode ? '#334155' : '#F1F5F9') }]}>
          <IconSymbol
            name={isUploaded ? 'doc.text.fill' : 'doc.fill'}
            size={18}
            color={isUploaded ? colors.accent : colors.textMuted}
          />
        </View>
        <View style={styles.contentCol}>
          <Text style={[styles.docName, { color: colors.textPrimary }]}>{docName}</Text>
          {formattedDate ? (
            <Text style={[styles.uploadDateText, { color: colors.textMuted }]}>
              Uploaded: {formattedDate}
            </Text>
          ) : (
            <Text style={[styles.uploadDateText, { color: colors.textMuted }]}>
              Not yet submitted
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
            onPress={() => onUploadOrReplace(document)}
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
      {isUploaded && document.screening_status ? (
        <View style={styles.screeningRow}>
          <Text style={[styles.screeningLabel, { color: colors.textSecondary }]}>AI Screening:</Text>
          <ScreeningBadge status={document.screening_status} compact />
        </View>
      ) : null}

      {/* Rejection Note if marked deficient */}
      {isRejected && document.rejection_reason ? (
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
  docName: {
    fontSize: 14,
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
});
