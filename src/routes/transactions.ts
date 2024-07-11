import crypto from 'node:crypto';
import { knex } from '../database';
import { FastifyInstance } from 'fastify';

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*');

    return transactions;
  });

  interface TransactionRequestBody {
    title: string;
    amount: number;
  }

  app.post('/transaction', async (request, reply) => {
    const { title, amount } = request.body as TransactionRequestBody;

    const transaction = await knex('transactions')
      .insert({
        id: crypto.randomUUID(),
        title,
        amount,
      })
      .returning('*');

    //console.log(JSON.stringify(transaction));

    return reply.send(transaction);
  });

  interface TransactionRequestParams {
    transactionId: string;
  }

  app.put('/transaction/:transactionId', async (request, reply) => {
    const { transactionId } = request.params as TransactionRequestParams;

    const { title, amount } = request.body as TransactionRequestBody;

    if (!title && !amount)
      return reply.code(400).send('Error: Both values are null');

    const updateTransaction = await knex('transactions')
      .where('id', transactionId)
      .update({ title, amount });

    return reply.send(updateTransaction);
  });

  app.delete('/transaction/:transactionId', async (request, reply) => {
    const { transactionId } = request.params as TransactionRequestParams;

    const transaction = await knex('transactions')
      .where('id', transactionId)
      .del();

    return reply.send(transaction);
  });
}
