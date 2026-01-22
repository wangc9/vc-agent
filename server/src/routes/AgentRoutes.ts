import { Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';

import { ChatDTOSchema, GetAnalysisDTOSchema } from '@src/models/dto';
import { get, post } from '@src/services/AgentService';

async function callAgent(req: JWTRequest, res: Response) {
  try {
    const result = ChatDTOSchema.safeParse(req.body);
    if (!req.auth?.id) {
      return res.status(403).json({ error: 'Unauthorised' });
    }

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const messages = await post({
      message: result.data.message,
      userId: req.auth?.id as string,
    });

    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ error: JSON.stringify(error) });
  }
}

async function getAssessments(req: JWTRequest, res: Response) {
  try {
    if (!req.auth?.id) {
      return res.status(403).json({ error: 'Unauthorised' });
    }
    const cursor = req.query.cursor;

    if (typeof cursor === 'object' || cursor === undefined) {
      return res.status(400).json({ error: 'Incorrect cursor' });
    }

    const parsedData = GetAnalysisDTOSchema.safeParse({
      userId: `${req.auth?.id}`,
      cursor,
    });

    if (!parsedData.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const assessments = await get({ ...parsedData.data });

    const hasNextPage = assessments.length > 9;
    const dataToReturn = hasNextPage ? assessments.slice(0, 9) : assessments;

    return res.json({
      assessments: dataToReturn,
      nextCursor: hasNextPage ? Number(cursor) + 9 : undefined,
    });
  } catch (error) {
    return res.status(500).json({ error: JSON.stringify(error) });
  }
}

export default { callAgent, getAssessments } as const;
