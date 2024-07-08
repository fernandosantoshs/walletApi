import fastify from 'fastify';
import crypto from 'node:crypto';
import { knex } from './database';

const app = fastify();

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

  console.log(JSON.stringify(transaction));

  return reply.send(transaction);
});

app.listen({ port: 3333 }).then(() => console.log('Server is running!'));
