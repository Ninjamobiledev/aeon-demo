import { strings } from '../../../../constants/strings';

export const DEFAULT_CURRENCY_CODE = 'INR';

const transactionLocale = 'en-IN';
// Keep transaction times in UTC so the same receipt date is shown on every device.
const transactionTimeZone = 'UTC';

const transferDateFormatter = new Intl.DateTimeFormat(transactionLocale, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: transactionTimeZone,
});

const transferDateTimeFormatter = new Intl.DateTimeFormat(transactionLocale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: transactionTimeZone,
});

export function formatSignedAmount(
  amount: number,
  hidden: boolean,
  currencyCode = DEFAULT_CURRENCY_CODE,
): string {
  if (hidden) {
    return strings.privacy.amountMask;
  }

  // Keep the sign visible so credits and negative refunds remain distinguishable.
  return new Intl.NumberFormat(transactionLocale, {
    style: 'currency',
    currency: currencyCode,
    signDisplay: 'always',
  }).format(amount);
}

export function formatTransferDate(transferDate?: string | null): string {
  const date = parseTransferDate(transferDate);

  return date
    ? transferDateFormatter.format(date)
    : strings.common.dateUnavailable;
}

export function formatTransferDateTime(transferDate?: string | null): string {
  const date = parseTransferDate(transferDate);

  return date
    ? transferDateTimeFormatter.format(date)
    : strings.common.dateUnavailable;
}

function parseTransferDate(transferDate?: string | null): Date | undefined {
  if (!transferDate) {
    return undefined;
  }

  const date = new Date(transferDate);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
