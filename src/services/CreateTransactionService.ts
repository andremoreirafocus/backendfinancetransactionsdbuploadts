import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if ((type === 'outcome') && (balance.total - value < 0)) {
      throw new AppError('Insufficient funds for the requested outcome!!!');
    }

    const categoriesRepository = getRepository(Category);

    const foundCategory = await categoriesRepository.findOne({
      where: { title: category }
    });

    var itemCategory;
    if (foundCategory) {
      itemCategory = foundCategory;
    }
    else {
      const newCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(newCategory);
      itemCategory = newCategory;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: itemCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
