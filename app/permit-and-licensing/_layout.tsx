import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { HeaderBar } from '@/src/components/common/HeaderBar';
import { StandaloneTabBar } from '@/src/components/navigation/StandaloneTabBar';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMIT_COLORS } from '@/src/features/permit-and-licensing';

export default function PermitAndLicensingLayout() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  return (
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <HeaderBar
        subtitle="Permit & Licensing Services"
        onNotificationPress={() => router.push('/(tabs)/notifications' as any)}
      />
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <StandaloneTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
