import crypto from 'node:crypto';
import { z } from 'zod';
import { knex } from '../database';
import { FastifyInstance } from 'fastify';

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['debit', 'credit']),
    });

    const { title, amount, type } = createTransactionSchema.parse(request.body);

    const transaction = await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    });

    return reply.status(201).send(transaction);
  });

  app.get('/', async () => {
    const transactions = await knex('transactions').select('*');

    return transactions;
  });

  app.get('/:transactionId', async (request, reply) => {
    const getTransactionSchema = z.object({
      transactionId: z.string(),
    });

    const { transactionId } = getTransactionSchema.parse(request.params);

    const transaction = await knex('transactions')
      .where('id', transactionId)
      .select('*');

    return reply.status(200).send(transaction);
  });

  app.put('/:transactionId', async (request, reply) => {
    const putTransactionSchema = z.object({
      transactionId: z.string(),
      title: z.string().nullable(),
      amount: z.number().nullable(),
    });

    const { transactionId } = putTransactionSchema.parse(request.params);

    const { title, amount } = putTransactionSchema.parse(request.body);

    if (!title && !amount)
      return reply.code(400).send('Error: At least one value must be filled');

    const updateTransaction = await knex('transactions')
      .where('id', transactionId)
      .update({ title, amount });

    return reply.send(updateTransaction);
  });

  app.delete('/:transactionId', async (request, reply) => {
    const deleteTransactionSchema = z.object({
      transactionId: z.string(),
    });

    const { transactionId } = deleteTransactionSchema.parse(request.params);

    const transaction = await knex('transactions')
      .where('id', transactionId)
      .del();

    return reply.status(200).send(transaction);
  });
}
