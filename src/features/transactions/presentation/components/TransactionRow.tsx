import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../../constants/colors';
import {
  dimensions,
  opacity,
  shadows,
  spacing,
} from '../../../../constants/dimensions';
import { strings } from '../../../../constants/strings';
import { typography } from '../../../../constants/typography';
import type { Transaction } from '../../domain/Transaction';
import {
  formatSignedAmount,
  formatTransferDate,
} from '../utils/formatTransaction';

type Props = {
  transaction: Transaction;
  amountsHidden: boolean;
  onPress: () => void;
};

export function TransactionRow({ transaction, amountsHidden, onPress }: Props) {
  const isOutgoing = transaction.amount < 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.accessibility.transactionRow(
        transaction.transferName,
        transaction.recipientName,
        formatTransferDate(transaction.transferDate),
        formatSignedAmount(transaction.amount, amountsHidden),
      )}
      accessibilityHint={strings.accessibility.transactionDetailsHint}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Text style={[styles.iconText, isOutgoing && styles.negativeIcon]}>
          {isOutgoing ? strings.symbols.outgoing : strings.symbols.incoming}
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.transferName} numberOfLines={1}>
          {transaction.transferName}
        </Text>
        <Text style={styles.recipient} numberOfLines={1}>
          {transaction.recipientName}
        </Text>
        <Text style={styles.date}>
          {formatTransferDate(transaction.transferDate)}
        </Text>
      </View>
      <View style={styles.amountBlock}>
        <Text
          style={[
            styles.amount,
            isOutgoing && styles.negative,
            amountsHidden && styles.maskedAmount,
          ]}
        >
          {formatSignedAmount(transaction.amount, amountsHidden)}
        </Text>
        <Text style={styles.reference}>{transaction.refId}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: dimensions.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s14,
    backgroundColor: colors.surface,
    borderRadius: dimensions.cardRadius,
    marginBottom: spacing.s10,
    shadowColor: colors.shadow,
    ...shadows.transactionCard,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  icon: {
    width: dimensions.iconSize,
    height: dimensions.iconSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.iconRadius,
    backgroundColor: colors.primaryMuted,
    marginRight: spacing.s12,
  },
  iconText: {
    color: colors.primary,
    fontSize: typography.fontSize.iconLarge,
    fontWeight: typography.fontWeight.medium,
  },
  negativeIcon: {
    color: colors.negativeAmount,
  },
  details: {
    flex: 1,
    minWidth: spacing.s0,
  },
  transferName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.bold,
  },
  recipient: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.bodyCompact,
    marginTop: spacing.s3,
  },
  date: {
    color: colors.textMuted,
    fontSize: typography.fontSize.bodySmall,
    marginTop: spacing.s5,
  },
  amountBlock: {
    alignItems: 'flex-end',
    marginLeft: spacing.s8,
  },
  amount: {
    color: colors.positiveAmount,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
  negative: {
    color: colors.negativeAmount,
  },
  maskedAmount: {
    color: colors.privacyMask,
  },
  reference: {
    color: colors.textSubtle,
    fontSize: typography.fontSize.caption,
    marginTop: spacing.s7,
  },
});
