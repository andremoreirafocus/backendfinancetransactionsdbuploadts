import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Result {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  // public async getBalance(): Promise<Balance> {
  public async getTransactionsWithBalance(): Promise<Result> {

    const transactions = await this.find({ relations: ["category"] });

    console.log(transactions);

    const incomeTotal = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((acc, transaction) => acc + Number(transaction.value), 0);

    const outcomeTotal = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((acc, transaction) => acc + Number(transaction.value), 0);

    const balance = {
      income: incomeTotal,
      outcome: outcomeTotal,
      total: incomeTotal - outcomeTotal,
    }

    return {
      transactions,
      balance,
    }

  }
}

export default TransactionsRepository;
