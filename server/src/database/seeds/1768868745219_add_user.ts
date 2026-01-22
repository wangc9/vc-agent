import type { Kysely } from 'kysely';

import { DB } from '../db';
import bcrypt from 'bcrypt';

export async function seed(db: Kysely<DB>): Promise<void> {
  const salt = await bcrypt.genSalt(Number(process.env.SALT || '10'))
  const hash = await bcrypt.hash('slushdemo', salt);
  await db
    .insertInto('user')
    .values({ email: 'demo@slush.org', password: hash })
    .execute();
}
