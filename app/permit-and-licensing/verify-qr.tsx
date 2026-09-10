import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import {
  PERMIT_COLORS,
  PermitVerificationResult,
  TproVerificationResult,
  VerificationResultCard,
  verifyBploPermit,
  verifyTproPermit,
} from '@/src/features/permit-and-licensing';

type VerificationMode = 'BPLO' | 'TPRO';

export default function VerifyPermitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; hash?: string; mode?: string }>();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const [mode, setMode] = useState<VerificationMode>(
    params.mode?.toUpperCase() === 'TPRO' ? 'TPRO' : 'BPLO'
  );
  const [inputValue, setInputValue] = useState(params.token || params.hash || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [bploResult, setBploResult] = useState<PermitVerificationResult | null>(null);
  const [tproResult, setTproResult] = useState<TproVerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-verify if token is provided via navigation params
  useEffect(() => {
    if (params.token && params.token.trim().length > 0) {
      setMode('BPLO');
      setInputValue(params.token.trim());
      executeVerification('BPLO', params.token.trim());
    } else if (params.hash && params.hash.trim().length > 0) {
      setMode('TPRO');
      setInputValue(params.hash.trim());
      executeVerification('TPRO', params.hash.trim());
    }
  }, [params.token, params.hash]);

  const executeVerification = async (targetMode: VerificationMode, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a verification code or query value.');
      return;
    }

    Keyboard.dismiss();
    setIsVerifying(true);
    setErrorMsg(null);
    setBploResult(null);
    setTproResult(null);

    try {
      if (targetMode === 'BPLO') {
        const res = await verifyBploPermit(trimmed);
        setBploResult(res);
      } else {
        const res = await verifyTproPermit(trimmed);
        setTproResult(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check your network connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyPress = () => {
    if (isVerifying) return;
    executeVerification(mode, inputValue);
  };

  const handleModeSwitch = (newMode: VerificationMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setInputValue('');
    setBploResult(null);
    setTproResult(null);
    setErrorMsg(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Nav Bar */}
      <View style={[styles.topNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}>
          <IconSymbol name="chevron.left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>
          Verify Permit Authenticity
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Verification Department Segmented Selector */}
        <View style={[styles.modeSelectorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>
            Select Permit Registry:
          </Text>
          <View style={[styles.segmentedRow, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                mode === 'BPLO' && {
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                },
              ]}
              onPress={() => handleModeSwitch('BPLO')}
              activeOpacity={0.8}>
              <IconSymbol
                name="building.2.fill"
                size={16}
                color={mode === 'BPLO' ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  {
                    color: mode === 'BPLO' ? colors.textPrimary : colors.textMuted,
                    fontWeight: mode === 'BPLO' ? '700' : '500',
                  },
                ]}>
                BPLO / Business
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                mode === 'TPRO' && {
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                },
              ]}
              onPress={() => handleModeSwitch('TPRO')}
              activeOpacity={0.8}>
              <IconSymbol
                name="car.fill"
                size={16}
                color={mode === 'TPRO' ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  {
                    color: mode === 'TPRO' ? colors.textPrimary : colors.textMuted,
                    fontWeight: mode === 'TPRO' ? '700' : '500',
                  },
                ]}>
                TPRO / Franchise
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Verification Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
            {mode === 'BPLO'
              ? 'Enter BPLO Verification Code / Token:'
              : 'Enter Franchise / Sticker / Plate / Hash:'}
          </Text>

          <Text style={[styles.inputHint, { color: colors.textMuted }]}>
            {mode === 'BPLO'
              ? 'Paste the 64-character verification code displayed on the digital permit or official document.'
              : 'Enter the franchise QR hash, sticker number, plate number, or application reference.'}
          </Text>

          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.textPrimary,
                  fontFamily: mode === 'BPLO' ? 'monospace' : undefined,
                },
              ]}
              placeholder={
                mode === 'BPLO'
                  ? 'e.g. 7f8a1c90...'
                  : 'e.g. TR-2026-001 or STK-8821'
              }
              placeholderTextColor={colors.textMuted}
              value={inputValue}
              onChangeText={(text) => {
                setInputValue(text);
                if (errorMsg) setErrorMsg(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isVerifying}
              returnKeyType="go"
              onSubmitEditing={handleVerifyPress}
            />

            {inputValue.length > 0 && !isVerifying ? (
              <TouchableOpacity
                onPress={() => {
                  setInputValue('');
                  setBploResult(null);
                  setTproResult(null);
                }}
                activeOpacity={0.7}
                style={styles.clearBtn}>
                <IconSymbol name="eye.slash.fill" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {errorMsg ? (
            <View style={styles.inlineErrorRow}>
              <IconSymbol name="exclamationmark.circle.fill" size={14} color={colors.danger} />
              <Text style={[styles.inlineErrorText, { color: colors.danger }]}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.verifyBtn,
              {
                backgroundColor: isVerifying || inputValue.trim().length === 0 ? (isDarkMode ? '#334155' : '#CBD5E1') : colors.accent,
              },
            ]}
            onPress={handleVerifyPress}
            disabled={isVerifying || inputValue.trim().length === 0}
            activeOpacity={0.85}>
            {isVerifying ? (
              <View style={styles.verifyingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.verifyBtnText}>Authenticating with City Registry...</Text>
              </View>
            ) : (
              <View style={styles.verifyingRow}>
                <IconSymbol name="checkmark.shield.fill" size={18} color="#FFFFFF" />
                <Text style={styles.verifyBtnText}>Verify Authenticity</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Verification Result Card */}
        {bploResult ? (
          <VerificationResultCard bploResult={bploResult} mode="BPLO" />
        ) : null}

        {tproResult ? (
          <VerificationResultCard tproResult={tproResult} mode="TPRO" />
        ) : null}

        {/* Security & Verification Guidelines */}
        <View style={[styles.guidelineCard, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
          <IconSymbol name="shield.lefthalf.filled" size={18} color={colors.accent} />
          <View style={styles.guidelineContent}>
            <Text style={[styles.guidelineTitle, { color: colors.textPrimary }]}>
              Municipal Verification Guarantee
            </Text>
            <Text style={[styles.guidelineText, { color: colors.textMuted }]}>
              Verification checks query the authoritative municipal permit database in real-time to prevent forgery, confirm payment clearance, and validate active licensing.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  modeSelectorCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentBtnText: {
    fontSize: 13,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 12,
  },
  clearBtn: {
    padding: 6,
  },
  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  inlineErrorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifyBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  guidelineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
