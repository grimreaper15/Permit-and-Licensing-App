import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '../styles/permit.styles';
import { AiScreeningData, PermitDocumentSummary, PermitUploadResult } from '../types/permit.types';
import { uploadPermitRequirement } from '../api/permitApi';
import { ScreeningBadge } from './ScreeningBadge';

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const OCR_PROCESSING_LIMIT_BYTES = 1 * 1024 * 1024; // 1 MB

interface DocumentUploadModalProps {
  visible: boolean;
  permitId: number | string;
  requirement?: PermitDocumentSummary | null;
  onClose: () => void;
  onUploadSuccess?: (result: PermitUploadResult) => void;
}

interface SelectedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  visible,
  permitId,
  requirement,
  onClose,
  onUploadSuccess,
}) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [screeningResult, setScreeningResult] = useState<PermitUploadResult | null>(null);

  const requirementName = requirement?.document_name || requirement?.name || 'Requirement Document';
  const requirementId = requirement?.id ? String(requirement.id) : (requirement?.requirement_id ? String(requirement.requirement_id) : '');

  const resetState = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadError(null);
    setScreeningResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePickDocument = async () => {
    setUploadError(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
          setUploadError('File size exceeds the 15 MB maximum limit. Please select a smaller file.');
          return;
        }

        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType || 'application/octet-stream',
        });
      }
    } catch {
      setUploadError('Failed to open document picker. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('permit_id', String(permitId));
      if (requirementId) {
        formData.append('requirement_id', requirementId);
      }
      formData.append('document_name', requirementName);
      formData.append('document', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      } as any);

      const result = await uploadPermitRequirement(formData);
      setScreeningResult(result);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document to server.');
    } finally {
      setIsUploading(false);
    }
  };

  const isLargeOcr = selectedFile?.size && selectedFile.size > OCR_PROCESSING_LIMIT_BYTES;

  const renderScreeningDetails = (screening?: AiScreeningData | null) => {
    if (!screening) return null;

    return (
      <View style={[styles.screeningCard, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
        <View style={styles.screeningHeader}>
          <IconSymbol name="sparkles" size={16} color={colors.accent} />
          <Text style={[styles.screeningTitle, { color: colors.textPrimary }]}>AI Document Screening</Text>
        </View>

        <View style={styles.badgeRow}>
          <ScreeningBadge status={screening.badge_status} qualityScore={screening.quality_score} />
        </View>

        {/* Quality and Legibility */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {screening.quality_score !== undefined ? `${Math.round(screening.quality_score)}%` : 'N/A'}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Quality Score</Text>
          </View>
          <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metricValue, { color: screening.is_legible ? colors.success : colors.danger }]}>
              {screening.is_legible ? 'Clear' : 'Blurry'}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Legibility</Text>
          </View>
          <View style={[styles.metricBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.metricValue, { color: screening.is_expired ? colors.danger : colors.success }]}>
              {screening.is_expired ? 'Expired' : 'Valid'}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Validity</Text>
          </View>
        </View>

        {/* Mismatches if any */}
        {screening.mismatches && screening.mismatches.length > 0 ? (
          <View style={[styles.mismatchBox, { backgroundColor: colors.warningLight }]}>
            <View style={styles.mismatchHeader}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={colors.warning} />
              <Text style={[styles.mismatchTitle, { color: colors.warning }]}>
                Review Discrepancies ({screening.mismatches.length})
              </Text>
            </View>
            {screening.mismatches.map((m, idx) => (
              <Text key={idx} style={[styles.mismatchItemText, { color: colors.textPrimary }]}>
                • {m.issue || m.field || 'Information mismatch detected'}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Disclaimer */}
        <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
          Automated screening assists LGU document evaluation. Official verification and approval remains with authorized LGU evaluators.
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleCol}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Upload Requirement</Text>
              <Text style={[styles.headerSub, { color: colors.textMuted }]} numberOfLines={1}>
                {requirementName}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
              <IconSymbol name="xmark" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Error Card */}
            {uploadError ? (
              <View style={[styles.errorCard, { backgroundColor: colors.dangerLight }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{uploadError}</Text>
              </View>
            ) : null}

            {/* Success View */}
            {screeningResult ? (
              <View style={styles.successContainer}>
                <View style={[styles.successIconCircle, { backgroundColor: colors.successLight }]}>
                  <IconSymbol name="checkmark.circle.fill" size={36} color={colors.success} />
                </View>
                <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                  Document Uploaded Successfully
                </Text>
                <Text style={[styles.successSub, { color: colors.textMuted }]}>
                  {screeningResult.original_filename} ({Math.round(screeningResult.file_size / 1024)} KB)
                </Text>

                {renderScreeningDetails(screeningResult.screening)}

                <TouchableOpacity
                  style={[styles.doneBtn, { backgroundColor: colors.accent }]}
                  onPress={handleClose}
                  activeOpacity={0.8}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* File Picker Section */}
                <TouchableOpacity
                  style={[
                    styles.pickerBox,
                    {
                      borderColor: selectedFile ? colors.accent : colors.border,
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    },
                  ]}
                  onPress={handlePickDocument}
                  disabled={isUploading}
                  activeOpacity={0.75}>
                  <View style={[styles.pickerIconCircle, { backgroundColor: colors.infoLight }]}>
                    <IconSymbol
                      name={selectedFile ? 'doc.text.fill' : 'arrow.up.doc.fill'}
                      size={24}
                      color={colors.accent}
                    />
                  </View>
                  <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>
                    {selectedFile ? selectedFile.name : 'Choose File to Upload'}
                  </Text>
                  <Text style={[styles.pickerSub, { color: colors.textMuted }]}>
                    Supported formats: PDF, JPEG, PNG (Max 15 MB)
                  </Text>
                </TouchableOpacity>

                {/* Selected File Details */}
                {selectedFile ? (
                  <View style={[styles.fileInfoCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
                    <View style={styles.fileInfoRow}>
                      <Text style={[styles.fileInfoLabel, { color: colors.textSecondary }]}>Filename:</Text>
                      <Text style={[styles.fileInfoValue, { color: colors.textPrimary }]} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                    </View>
                    {selectedFile.size ? (
                      <View style={styles.fileInfoRow}>
                        <Text style={[styles.fileInfoLabel, { color: colors.textSecondary }]}>Size:</Text>
                        <Text style={[styles.fileInfoValue, { color: colors.textPrimary }]}>
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </Text>
                      </View>
                    ) : null}

                    {isLargeOcr ? (
                      <View style={[styles.ocrNotice, { backgroundColor: colors.infoLight }]}>
                        <IconSymbol name="info.circle.fill" size={14} color={colors.accent} />
                        <Text style={[styles.ocrNoticeText, { color: colors.accent }]}>
                          File size is above 1 MB. The document will be securely stored; automated OCR screening may be queued for manual evaluator review.
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={handleClose}
                    disabled={isUploading}
                    activeOpacity={0.7}>
                    <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.uploadBtn,
                      {
                        backgroundColor: selectedFile && !isUploading ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={handleUpload}
                    disabled={!selectedFile || isUploading}
                    activeOpacity={0.8}>
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol name="arrow.up.circle.fill" size={16} color="#FFFFFF" />
                        <Text style={styles.uploadBtnText}>Upload & Screen</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  titleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyScroll: {
    padding: 18,
    gap: 14,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  pickerBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pickerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  pickerSub: {
    fontSize: 11,
    textAlign: 'center',
  },
  fileInfoCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  fileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fileInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fileInfoValue: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  ocrNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  ocrNoticeText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  uploadBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  screeningCard: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 6,
  },
  screeningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  screeningTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  mismatchBox: {
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  mismatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mismatchTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  mismatchItemText: {
    fontSize: 11,
    lineHeight: 15,
  },
  disclaimerText: {
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
