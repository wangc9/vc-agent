import { Request, Response } from 'express';

import { LoginDTOSchema } from '@src/models/dto';
import { login } from '@src/services/AuthService';

async function post(req: Request, res: Response) {
  try {
    const result = LoginDTOSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const response = await login({
      email: result.data.email,
      password: result.data.password,
    });

    return res.json({ ...response });
  } catch (error) {
    return res.status(500).json({ error: JSON.stringify(error) });
  }
}

export default { post } as const;
