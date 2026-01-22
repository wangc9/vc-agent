import z from 'zod';

import { db } from '@src/database';
import { GetAnalysisDTOSchema, RunAgentDTOSchema } from '@src/models/dto';

import { agent } from './agent';

export async function post({
  message,
  userId,
}: z.infer<typeof RunAgentDTOSchema>) {
  const result = await agent.invoke(
    {
      messages: [{ role: 'user', content: `${message}` }],
    },
    { configurable: { thread_id: userId, user_id: userId } },
  );

  return result?.messages;
}

export async function get({
  userId,
  cursor,
}: z.infer<typeof GetAnalysisDTOSchema>) {
  const assessments = await db
    .selectFrom('application')
    .select(['startup_name', 'industry', 'analysis'])
    .where('user_id', '=', Number(userId))
    .limit(10)
    .offset(Number(cursor))
    .orderBy('application.id', 'desc')
    .execute();

  return assessments;
}
