import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

function getTransactionValue(transaction: Transaction): number {
    return transaction.type === 'income'? Number(transaction.value) : - Number(transaction.value);
}

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactionsWithBalance = await transactionsRepository.getTransactionsWithBalance();

  return response.json(transactionsWithBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const {title, value, type, category} = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
