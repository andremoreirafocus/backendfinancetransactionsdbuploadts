import csvParse from 'csv-parse';
import fs from 'fs';

import { getCustomRepository, getRepository, In } from 'typeorm';

import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  filename: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryTitle: string;
}

interface TransactionWithRelations {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: Category | undefined;
}

class ImportTransactionsService {
  public async execute(request: Request): Promise<TransactionWithRelations[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // const transactions: Transaction[];
    var inputFile= request.filename;

    const transactionsReadStream = fs.createReadStream(inputFile);

    const parser = csvParse({
      delimiter: ',',
      from_line: 2,
    });

    const transactions: CSVTransaction[] = [];
    const categoryTitles: string[] = [];

    const parsedCSV = transactionsReadStream.pipe(parser);

    // let n = 1;
    parsedCSV.on('data', async line => {
      const [ title, type, value, categoryTitle ] = line.map((field: string) => field.trim());
      // console.log(n, ' ', line);
      // console.log(title, type, value, category);
      // n++;
      if ( !title || !type || !value)
        return;

        transactions.push({title, type, value, categoryTitle});
        categoryTitles.push(categoryTitle);
      });

    await new Promise (resolve => parsedCSV.on('end', resolve));

    console.log(categoryTitles);
    const existingCategories = await categoriesRepository.find({
      where: {
        title: In(categoryTitles),
      },
    });
    console.log('existing:', existingCategories);
    // console.log(transactions);

    const titlesExistingCategories = existingCategories.map((category: Category) => category.title);

    const titlesCategoriesToBeAdded = categoryTitles
      .filter((categoryTitle: string) => !titlesExistingCategories.includes(categoryTitle))
      .filter((value, index, self) => self.indexOf(value) === index);
    console.log(titlesCategoriesToBeAdded);

    const newCategories = categoriesRepository.create(
      titlesCategoriesToBeAdded.map((title) => ({title}))
    );

    console.log(newCategories);

    await categoriesRepository.save(newCategories);

    const allCategories = [...newCategories, ...existingCategories];
    console.log(allCategories);

    const transactionsToImport =
      transactions.map(transaction => {
        const { title, type, value, categoryTitle } = transaction;
        // const foundCategory = allCategories.find((category:Category) => category.title === categoryTitle);
        return {
          title,
          type,
          value,
          // category_id: foundCategory.id,
          category: allCategories.find((category:Category) => category.title === categoryTitle),
        }
      })

    // console.log('To import');
    console.log(transactionsToImport);

    const importedTransactions = transactionsRepository.create(transactionsToImport);

    await transactionsRepository.save(importedTransactions);

    // console.log('Imported');

    console.log(importedTransactions);

    // fs.promises.unlink(inputFile)

    return transactionsToImport;
  }
}

export default ImportTransactionsService;
