import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const foundTransaction = await transactionsRepository.find({
      where: {id: id}
    })

    if (foundTransaction.length === 0) {
      throw new AppError('Delete operation failed: id not found!!!');
    }
    // console.log(foundTransaction);
    await transactionsRepository.remove(foundTransaction);
  }
}

export default DeleteTransactionService;
