import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

function getTransactionValue(transaction: Transaction): number {
    return transaction.type === 'income'? Number(transaction.value) : - Number(transaction.value);
}

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({ relations: ["category_id"] });

  const balance = await transactionsRepository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const {title, value, type, category} = request.body;

  // const transactionsRepository = getCustomRepository(TransactionsRepository);

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
  const {id} = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute (id);

  return response.status(204).send();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  // TODO
  const filename = path.resolve(request.file.destination, request.file.filename);
  console.log(filename);

  const importTransactionsService = new ImportTransactionsService();

  const transactions = await importTransactionsService.execute({filename});

  return response.json(transactions);
});

export default transactionsRouter;
