import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
  ApplicationCard,
  PERMIT_COLORS,
  PermitApplication,
  usePermitApplications,
} from '@/src/features/permit-and-licensing';

type FilterTab = 'ALL' | 'ISSUED' | 'IN_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED';

export default function MyApplicationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? PERMIT_COLORS.dark : PERMIT_COLORS.light;

  const { applications, isLoading, isRefreshing, error, refresh } = usePermitApplications();
  const [searchQuery, setSearchQuery] = useState('');

  const initialTab: FilterTab =
    params.tab?.toUpperCase() === 'ISSUED'
      ? 'ISSUED'
      : params.tab?.toUpperCase() === 'IN_REVIEW'
      ? 'IN_REVIEW'
      : params.tab?.toUpperCase() === 'ACTION_REQUIRED'
      ? 'ACTION_REQUIRED'
      : params.tab?.toUpperCase() === 'APPROVED'
      ? 'APPROVED'
      : 'ALL';

  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);

  const issuedCount = useMemo(() => {
    return applications.filter((app) => {
      const rawStatus = (app.status || app.current_status || '').toLowerCase();
      const rawIssuance = (app.issuance_status || '').toLowerCase();
      return rawIssuance === 'issued' || rawStatus === 'issued';
    }).length;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Tab filter
      const rawStatus = (app.status || app.current_status || '').toLowerCase();
      const rawIssuance = (app.issuance_status || '').toLowerCase();

      if (activeTab === 'ISSUED') {
        const isIssued = rawIssuance === 'issued' || rawStatus === 'issued';
        if (!isIssued) return false;
      } else if (activeTab === 'IN_REVIEW') {
        const match = ['submitted', 'under_review', 'document_screening', 'pending'].includes(rawStatus);
        if (!match) return false;
      } else if (activeTab === 'ACTION_REQUIRED') {
        const match = ['pending_requirements', 'needs_action', 'fee_assessment', 'pending_payment'].includes(rawStatus);
        if (!match) return false;
      } else if (activeTab === 'APPROVED') {
        const match = ['approved', 'payment_verified', 'inspection_passed'].includes(rawStatus);
        if (!match) return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const appNo = (app.application_no || '').toLowerCase();
        const bName = (app.business_name || '').toLowerCase();
        const pType = (app.permit_type || app.type || '').toLowerCase();
        const oName = (app.owner_name || '').toLowerCase();

        return appNo.includes(q) || bName.includes(q) || pType.includes(q) || oName.includes(q);
      }

      return true;
    });
  }, [applications, activeTab, searchQuery]);

  const handleCardPress = (selected: PermitApplication) => {
    router.push({
      pathname: '/permit-and-licensing/details' as any,
      params: {
        application_no: selected.application_no,
        id: String(selected.permit_id || selected.id || ''),
      },
    });
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: `All (${applications.length})` },
    { key: 'ISSUED', label: `Issued (${issuedCount})` },
    { key: 'IN_REVIEW', label: 'In Review' },
    { key: 'ACTION_REQUIRED', label: 'Action Needed' },
    { key: 'APPROVED', label: 'Approved' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.topNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}>
          <IconSymbol name="chevron.left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>
          My Applications
        </Text>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.push('/permit-and-licensing/tracking' as any)}
          activeOpacity={0.75}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Search Input Box */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by application no, business, or permit type"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <IconSymbol name="eye.slash.fill" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isActive ? (isDarkMode ? '#0369A1' : '#176B87') : 'transparent',
                    borderColor: isActive ? (isDarkMode ? '#38BDF8' : '#176B87') : colors.border,
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}>
                <Text
                  style={[
                    styles.tabBtnText,
                    {
                      color: isActive ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Applications List */}
      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading permit records...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={32} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.danger }]}>Unable to Load Applications</Text>
          <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={() => refresh()}
            activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => String(item.permit_id || item.id || item.application_no)}
          renderItem={({ item }) => (
            <ApplicationCard application={item} onPress={handleCardPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol name="doc.text.fill" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {searchQuery || activeTab !== 'ALL'
                  ? 'No Matching Applications'
                  : 'No Permit Applications on File'}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                {searchQuery || activeTab !== 'ALL'
                  ? 'Try changing your search keywords or switching filters.'
                  : 'You do not have any registered permit applications in this account.'}
              </Text>
            </View>
          }
        />
      )}
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
  trackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
