import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';
import fs from 'fs';
const csvFilePath='<path to csv file>'
import parse from 'csv-parse';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  public async execute(request: Request): Promise<void> {
  const createTransactionService = new CreateTransactionService();

  // const transactions: Transaction[];
  var inputFile= request.filename;

  var csvData: string[] = [];
  fs.createReadStream(request.filename)
      .pipe(parse({delimiter: ','}))
      .on('data', function(csvrow) {
          console.log(csvrow);
          //do something with csvrow
          csvData.push(csvrow);
      })
      .on('end',function() {
        //do something with csvData
        console.log(csvData);
      });  // console.log(data);
  }
}

export default ImportTransactionsService;
