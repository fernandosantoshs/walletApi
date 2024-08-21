import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'child_process';

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Coxinha',
        amount: 20,
        type: 'debit',
      })
      .expect(201);
  });

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Coxinha',
        amount: 30,
        type: 'debit',
      })
      .expect(201);

    const cookies = createTransactionResponse.get('Set-Cookie') ?? [];

    const listTransactionReponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    expect(listTransactionReponse.body).toEqual([
      expect.objectContaining({ title: 'Coxinha', amount: -30 }),
    ]);
  });

  it('should be able to list a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Coxinha',
        amount: 30,
        type: 'debit',
      })
      .expect(201);

    const cookies = createTransactionResponse.get('Set-Cookie') ?? [];

    const listTransactionsReponse = await request(app.server)
      .get('/transactions/')
      .set('Cookie', cookies)
      .expect(200);

    const transactionId = listTransactionsReponse.body[0].id;

    const listSpecificTransactionReponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(listSpecificTransactionReponse.body.transaction).toEqual(
      expect.objectContaining({ title: 'Coxinha', amount: -30 })
    );
  });
});
