import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../../../constants/colors';
import {
  dimensions,
  opacity,
  shadows,
  spacing,
} from '../../../../constants/dimensions';
import { strings } from '../../../../constants/strings';
import { typography } from '../../../../constants/typography';
import { MockTransactionsRepository } from '../../data/MockTransactionsRepository';
import { GetTransactionById } from '../../domain/GetTransactionById';
import type { Transaction } from '../../domain/Transaction';
import { PrivacyToggle } from '../components/PrivacyToggle';
import type { TransactionStackParamList } from '../navigation/types';
import { usePrivacyStore } from '../store/privacyStore';
import {
  formatSignedAmount,
  formatTransferDateTime,
} from '../utils/formatTransaction';

type Props = NativeStackScreenProps<
  TransactionStackParamList,
  'TransactionDetails'
>;

const getTransactionById = new GetTransactionById(
  new MockTransactionsRepository(),
);

export function TransactionDetailsScreen({ route, navigation }: Props) {
  const [transaction, setTransaction] = useState<Transaction>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const amountsHidden = usePrivacyStore(state => state.amountsHidden);

  useEffect(() => {
    let isMounted = true;

    const loadTransaction = async () => {
      try {
        const result = await getTransactionById.execute(route.params.refId);
        // Ignore a late lookup if navigation unmounts this screen first.
        if (isMounted) {
          setTransaction(result);
        }
      } catch {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTransaction();
    return () => {
      isMounted = false;
    };
  }, [route.params.refId]);

  const shareTransaction = async () => {
    if (!transaction) {
      return;
    }

    // Privacy masking is display-only; sharing is explicit and includes the actual amount.
    const transferAmount = formatSignedAmount(transaction.amount, false);
    const receipt = [
      strings.sharing.receiptTitle,
      `${strings.sharing.transfer} ${transaction.transferName}`,
      `${strings.sharing.recipient} ${transaction.recipientName}`,
      `${strings.sharing.referenceId} ${transaction.refId}`,
      `${strings.sharing.date} ${formatTransferDateTime(
        transaction.transferDate,
      )}`,
      `${strings.sharing.amount} ${transferAmount}`,
    ].join('\n');

    try {
      await Share.share({
        message: receipt,
        title: strings.sharing.shareSheetTitle,
      });
    } catch {
      Alert.alert(strings.sharing.errorTitle, strings.sharing.errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>{strings.details.loading}</Text>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.centered}>
        <Text style={styles.stateTitle}>
          {error
            ? strings.details.loadErrorTitle
            : strings.details.notFoundTitle}
        </Text>
        <Text style={styles.stateText}>
          {error
            ? strings.details.loadErrorMessage
            : strings.details.notFoundMessage}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            {strings.common.backToTransactions}
          </Text>
        </Pressable>
      </View>
    );
  }

  const isOutgoing = transaction.amount < 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.accessibility.back}
          onPress={() => navigation.goBack()}
          hitSlop={dimensions.backHitSlop}
          style={styles.backCircle}
        >
          <Text style={styles.backChevron}>{strings.symbols.back}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{strings.details.title}</Text>
      </View>

      <View style={styles.privacyRow}>
        <PrivacyToggle />
      </View>

      <View style={styles.receipt}>
        <View style={styles.receiptTop}>
          <View style={styles.receiptIcon}>
            <Text
              style={[
                styles.receiptIconText,
                isOutgoing && styles.negativeIcon,
              ]}
            >
              {isOutgoing ? strings.symbols.outgoing : strings.symbols.incoming}
            </Text>
          </View>
          <Text style={styles.kicker}>
            {isOutgoing ? strings.details.sent : strings.details.received}
          </Text>
          <Text
            style={[
              styles.amount,
              isOutgoing && styles.negative,
              amountsHidden && styles.maskedAmount,
            ]}
          >
            {formatSignedAmount(transaction.amount, amountsHidden)}
          </Text>
          <Text style={styles.transferName}>{transaction.transferName}</Text>
          <Text style={styles.recipient}>{transaction.recipientName}</Text>
        </View>

        <View style={styles.dottedRule} />

        <View style={styles.receiptDetails}>
          <DetailRow
            label={strings.common.recipient}
            value={transaction.recipientName}
          />
          <DetailRow
            label={strings.common.referenceId}
            value={transaction.refId}
          />
          <DetailRow
            label={strings.common.transferDate}
            value={formatTransferDateTime(transaction.transferDate)}
          />
          <DetailRow
            label={strings.common.transferAmount}
            value={formatSignedAmount(transaction.amount, amountsHidden)}
            valueStyle={
              amountsHidden
                ? styles.maskedAmount
                : isOutgoing
                ? styles.negative
                : styles.positive
            }
          />
        </View>

        <View style={styles.receiptFooter}>
          <Text style={styles.footerBrand}>{strings.brand.name}</Text>
          <Text style={styles.footerCopy}>{strings.details.keepReceipt}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.accessibility.shareReceipt}
        onPress={() => shareTransaction()}
        style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
      >
        <Text style={styles.shareIcon}>{strings.symbols.share}</Text>
        <Text style={styles.shareLabel}>{strings.details.shareButton}</Text>
      </Pressable>
    </ScrollView>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  valueStyle?: object;
};

function DetailRow({ label, value, valueStyle }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: dimensions.screenPadding,
    paddingTop: spacing.s12,
    paddingBottom: spacing.s32,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s22,
    minHeight: dimensions.headerMinHeight,
  },
  backCircle: {
    width: dimensions.backButtonSize,
    height: dimensions.backButtonSize,
    borderRadius: dimensions.circleRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  backChevron: {
    color: colors.receiptText,
    fontSize: typography.fontSize.heading,
    lineHeight: typography.lineHeight.backChevron,
    marginTop: -spacing.s3,
  },
  headerTitle: {
    flex: 1,
    color: colors.receiptText,
    fontSize: typography.fontSize.titleSmall,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.s12,
  },
  privacyRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.s10,
  },
  receipt: {
    overflow: 'hidden',
    borderRadius: dimensions.receiptRadius,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    ...shadows.receipt,
  },
  receiptTop: {
    alignItems: 'center',
    paddingHorizontal: spacing.s24,
    paddingTop: spacing.s30,
    paddingBottom: spacing.s28,
  },
  receiptIcon: {
    width: dimensions.receiptIconSize,
    height: dimensions.receiptIconSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.receiptIconRadius,
    backgroundColor: colors.primaryMuted,
  },
  receiptIconText: {
    color: colors.primary,
    fontSize: typography.fontSize.searchGlyph,
    fontWeight: typography.fontWeight.medium,
  },
  negativeIcon: {
    color: colors.negativeAmount,
  },
  kicker: {
    color: colors.receiptKicker,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extraBold,
    letterSpacing: typography.letterSpacing.brand,
    marginTop: spacing.s17,
  },
  amount: {
    color: colors.positiveAmount,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.extraBold,
    letterSpacing: typography.letterSpacing.compact,
    marginTop: spacing.s8,
  },
  negative: {
    color: colors.negativeAmount,
  },
  maskedAmount: {
    color: colors.privacyMask,
  },
  positive: {
    color: colors.positiveAmount,
  },
  transferName: {
    color: colors.receiptText,
    fontSize: typography.fontSize.titleSmall,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.s8,
    textAlign: 'center',
  },
  recipient: {
    color: colors.receiptMuted,
    fontSize: typography.fontSize.body,
    marginTop: spacing.s4,
  },
  dottedRule: {
    height: spacing.s1,
    borderTopWidth: spacing.s1,
    borderColor: colors.borderDashed,
    borderStyle: 'dashed',
    marginHorizontal: spacing.s22,
  },
  receiptDetails: {
    paddingHorizontal: spacing.s22,
    paddingVertical: spacing.s8,
    gap: spacing.s2,
  },
  detailRow: {
    minHeight: dimensions.detailRowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s12,
  },
  detailLabel: {
    color: colors.detailMuted,
    fontSize: typography.fontSize.bodyCompact,
    flexShrink: 0,
  },
  detailValue: {
    color: colors.receiptDetail,
    fontSize: typography.fontSize.bodyCompact,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'right',
    flexShrink: 1,
  },
  receiptFooter: {
    alignItems: 'center',
    paddingTop: spacing.s18,
    paddingBottom: spacing.s22,
    backgroundColor: colors.surfaceMuted,
  },
  footerBrand: {
    color: colors.primary,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extraBold,
    letterSpacing: typography.letterSpacing.brandWide,
  },
  footerCopy: {
    color: colors.textFaint,
    fontSize: typography.fontSize.small,
    marginTop: spacing.s6,
  },
  shareButton: {
    minHeight: dimensions.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s9,
    marginTop: spacing.s18,
    borderRadius: dimensions.cardRadius,
    backgroundColor: colors.secondary,
  },
  pressed: {
    opacity: opacity.pressedStrong,
  },
  shareIcon: {
    color: colors.white,
    fontSize: typography.fontSize.icon,
  },
  shareLabel: {
    color: colors.white,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.bold,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.s28,
    backgroundColor: colors.background,
  },
  stateTitle: {
    color: colors.stateTitle,
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  stateText: {
    color: colors.stateMuted,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    marginTop: spacing.s9,
  },
  backButton: {
    minHeight: dimensions.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.s18,
    marginTop: spacing.s18,
    borderRadius: dimensions.backButtonRadius,
    backgroundColor: colors.primary,
  },
  backButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
});
