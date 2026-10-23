import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../../../constants/colors';
import { dimensions, spacing } from '../../../../constants/dimensions';
import { strings } from '../../../../constants/strings';
import { typography } from '../../../../constants/typography';
import { MockTransactionsRepository } from '../../data/MockTransactionsRepository';
import { GetTransactions } from '../../domain/GetTransactions';
import type { Transaction } from '../../domain/Transaction';
import { PrivacyToggle } from '../components/PrivacyToggle';
import { TransactionRow } from '../components/TransactionRow';
import type { TransactionStackParamList } from '../navigation/types';
import { usePrivacyStore } from '../store/privacyStore';

type Props = NativeStackScreenProps<
  TransactionStackParamList,
  'TransactionHistory'
>;
type Filter = keyof typeof strings.history.filters;

const getTransactions = new GetTransactions(new MockTransactionsRepository());
const filters: Filter[] = ['all', 'incoming', 'outgoing'];

export function TransactionHistoryScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const amountsHidden = usePrivacyStore(state => state.amountsHidden);

  const loadTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(false);

    try {
      setTransactions(await getTransactions.execute());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions.filter(transaction => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          transaction.recipientName,
          transaction.transferName,
          transaction.refId,
        ].some(value => value.toLowerCase().includes(normalizedQuery));
      const matchesFilter =
        filter === 'all' ||
        // Direction comes from the amount sign because the model has no direction field.
        (filter === 'incoming' && transaction.amount >= 0) ||
        (filter === 'outgoing' && transaction.amount < 0);

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, transactions]);

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateText}>{strings.history.loading}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>
            {strings.history.loadErrorTitle}
          </Text>
          <Text style={styles.stateText}>
            {strings.history.loadErrorMessage}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => loadTransactions()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>{strings.common.tryAgain}</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateTitle}>{strings.history.emptyTitle}</Text>
        <Text style={styles.stateText}>{strings.history.emptyMessage}</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.refId}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            amountsHidden={amountsHidden}
            onPress={() =>
              navigation.navigate('TransactionDetails', { refId: item.refId })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTransactions(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.topline}>
              <View>
                <Text style={styles.eyebrow}>{strings.brand.name}</Text>
                <Text style={styles.heading}>{strings.history.title}</Text>
              </View>
            </View>
            {error && transactions.length > 0 && (
              <View style={styles.inlineError}>
                <Text style={styles.inlineErrorText}>
                  {strings.history.refreshError}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => loadTransactions()}
                  style={styles.inlineRetryButton}
                >
                  <Text style={styles.inlineRetryText}>
                    {strings.common.retry}
                  </Text>
                </Pressable>
              </View>
            )}
            <Text style={styles.subtitle}>{strings.history.subtitle}</Text>
            <View style={styles.privacyRow}>
              <PrivacyToggle />
            </View>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>{strings.symbols.search}</Text>
              <TextInput
                accessibilityLabel={strings.history.searchAccessibilityLabel}
                placeholder={strings.history.searchPlaceholder}
                placeholderTextColor={colors.placeholder}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    strings.history.clearSearchAccessibilityLabel
                  }
                  onPress={() => setQuery('')}
                  hitSlop={dimensions.searchHitSlop}
                >
                  <Text style={styles.clearSearch}>
                    {strings.symbols.clear}
                  </Text>
                </Pressable>
              )}
            </View>
            <View style={styles.filters}>
              {filters.map(item => {
                const selected = filter === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setFilter(item)}
                    style={[styles.filter, selected && styles.filterSelected]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        selected && styles.filterLabelSelected,
                      ]}
                    >
                      {strings.history.filters[item]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.sectionTitle}>
              {strings.history.sectionTitle}
            </Text>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: dimensions.screenPadding,
    paddingTop: spacing.s18,
    paddingBottom: spacing.s32,
    flexGrow: 1,
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineError: {
    minHeight: dimensions.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.s14,
    marginTop: spacing.s14,
    borderRadius: dimensions.errorRadius,
    backgroundColor: colors.errorBackground,
  },
  inlineErrorText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.fontSize.bodyCompact,
  },
  inlineRetryButton: {
    minWidth: dimensions.retryButtonMinWidth,
    minHeight: dimensions.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineRetryText: {
    color: colors.error,
    fontSize: typography.fontSize.bodyCompact,
    fontWeight: typography.fontWeight.bold,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extraBold,
    letterSpacing: typography.letterSpacing.brand,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.extraBold,
    letterSpacing: typography.letterSpacing.heading,
    marginTop: spacing.s5,
  },
  subtitle: {
    color: colors.headerMuted,
    fontSize: typography.fontSize.body,
    marginTop: spacing.s6,
    marginBottom: spacing.s4,
  },
  privacyRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.s10,
  },
  searchBox: {
    height: dimensions.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s14,
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderWidth: spacing.s1,
    borderRadius: dimensions.searchRadius,
  },
  searchIcon: {
    color: colors.iconMuted,
    fontSize: typography.fontSize.searchGlyph,
    marginRight: spacing.s9,
    marginTop: -spacing.s3,
  },
  searchInput: {
    flex: 1,
    padding: spacing.s0,
    color: colors.textPrimary,
    fontSize: typography.fontSize.body,
  },
  clearSearch: {
    color: colors.iconMuted,
    fontSize: typography.fontSize.searchIcon,
    paddingHorizontal: spacing.s4,
  },
  filters: {
    flexDirection: 'row',
    marginTop: spacing.s16,
    marginBottom: spacing.s24,
    gap: spacing.s8,
  },
  filter: {
    minHeight: dimensions.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.s17,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: spacing.s1,
    borderRadius: dimensions.pillRadius,
  },
  filterSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterLabel: {
    color: colors.filterText,
    fontSize: typography.fontSize.bodyCompact,
    fontWeight: typography.fontWeight.medium,
  },
  filterLabelSelected: {
    color: colors.filterSelectedText,
  },
  sectionTitle: {
    color: colors.stateTitle,
    fontSize: typography.fontSize.titleSmall,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.s12,
  },
  stateContainer: {
    flex: 1,
    minHeight: dimensions.emptyStateMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.s24,
  },
  stateTitle: {
    color: colors.stateTitle,
    fontSize: typography.fontSize.titleSmall,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  stateText: {
    color: colors.stateMuted,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    marginTop: spacing.s8,
  },
  retryButton: {
    minHeight: dimensions.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.s20,
    marginTop: spacing.s18,
    borderRadius: dimensions.errorRadius,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.white,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
});
