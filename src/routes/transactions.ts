import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'node:crypto';
import { knex } from '../database';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['debit', 'credit']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days (in seconds)
      });
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });

  app.get('/all', async (request, reply) => {
    const transactions = await knex('transactions').select('*');

    return reply.status(200).send(transactions);
  });

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*');

      return transactions;
    }
  );

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const transaction = await knex('transactions')
        .where({ session_id: sessionId, id })
        .first();

      return { transaction };
    }
  );

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first();

      return { summary };
    }
  );

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const putTransactionSchema = z.object({
        id: z.string(),
        title: z.string(),
        amount: z.number(),
      });

      const { id } = putTransactionSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const { title, amount } = putTransactionSchema.parse(request.body);

      if (!title && !amount)
        return reply.code(400).send('Error: At least one value must be filled');

      const updateTransaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .update({ title, amount });

      return reply.send(updateTransaction);
    }
  );

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const deleteTransactionParamsSchema = z.object({
        id: z.string(),
      });

      const { id } = deleteTransactionParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const transaction = await knex('transactions')
        .where({
          //session_id: sessionId,
          id,
        })
        .del();

      if (!transaction)
        return reply
          .status(404)
          .send({ message: 'Wrong session id or transaction not found' });

      return reply.status(200).send(transaction);
    }
  );
}
