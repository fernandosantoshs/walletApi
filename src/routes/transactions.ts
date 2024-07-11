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

  app.delete('/transaction/:transactionId', async (request, reply) => {
    const { transactionId } = request.params as TransactionRequestParams;

    const transaction = await knex('transactions')
      .where('id', transactionId)
      .del();

    return reply.send(transaction);
  });
}
