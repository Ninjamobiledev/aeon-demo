import type { Transaction } from './Transaction';
import type { TransactionsRepository } from './TransactionsRepository';

export class GetTransactionById {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  execute(refId: string): Promise<Transaction | undefined> {
    return this.transactionsRepository.getTransactionByRefId(refId);
  }
}
