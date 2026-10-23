import type { Transaction } from './Transaction';

export interface TransactionsRepository {
  getTransactions(): Promise<Transaction[]>;
  getTransactionByRefId(refId: string): Promise<Transaction | undefined>;
}
