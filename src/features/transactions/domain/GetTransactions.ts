import type { Transaction } from './Transaction';
import type { TransactionsRepository } from './TransactionsRepository';

export class GetTransactions {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  execute(): Promise<Transaction[]> {
    return this.transactionsRepository.getTransactions();
  }
}
