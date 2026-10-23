import type { Transaction } from '../domain/Transaction';
import type { TransactionsRepository } from '../domain/TransactionsRepository';
import { mockTransactions } from './mockTransactions';

export class MockTransactionsRepository implements TransactionsRepository {
  async getTransactions(): Promise<Transaction[]> {
    // Keep data-source details here, and sort a copy so the source records stay unchanged.
    return [...mockTransactions].sort(
      (first, second) =>
        Date.parse(second.transferDate) - Date.parse(first.transferDate),
    );
  }

  async getTransactionByRefId(refId: string): Promise<Transaction | undefined> {
    return mockTransactions.find(transaction => transaction.refId === refId);
  }
}
