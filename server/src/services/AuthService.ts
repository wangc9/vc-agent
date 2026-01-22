import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import z from 'zod';

import { db } from '@src/database';
import { LoginDTOSchema } from '@src/models/dto';

export async function login({
  email,
  password,
}: z.infer<typeof LoginDTOSchema>) {
  try {
    const user = await db
      .selectFrom('user')
      .select(['password', 'id'])
      .where('email', '=', email)
      .executeTakeFirstOrThrow();

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1h',
        },
      );

      return { status: 'success', token };
    } else {
      return { status: 'error' };
    }
  } catch (error) {
    return { status: 'error' };
  }
}
