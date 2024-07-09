import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  throw new Error('Invalid/missing enviroment variables!');
}

export const env = _env.data;
