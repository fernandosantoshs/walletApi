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

  app.get('/:id', async (request, reply) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex('transactions').where('id', id).first();

    return { transaction };
  });

  app.get('/summary', async (request, reply) => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first();

    return { summary };
  });

  app.put('/:id', async (request, reply) => {
    const putTransactionSchema = z.object({
      id: z.string(),
      title: z.string(),
      amount: z.number(),
    });

    const { id: transactionId } = putTransactionSchema.parse(request.params);

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
