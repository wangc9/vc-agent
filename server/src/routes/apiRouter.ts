import { Router } from 'express';
import { expressjwt } from 'express-jwt';

import AgentRoutes from './AgentRoutes';
import AuthRoutes from './AuthRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ----------------------- Add UserRouter ---------------------------------- //

const agentRouter = Router();

agentRouter.post(
  '/',
  expressjwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
  }),
  AgentRoutes.callAgent,
);

apiRouter.use('/agent', agentRouter);

const authRouter = Router();

authRouter.post('/', AuthRoutes.post);

apiRouter.use('/login', authRouter);

const assessRouter = Router();

assessRouter.get(
  '/',
  expressjwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
  }),
  AgentRoutes.getAssessments,
);

apiRouter.use('/assessments', assessRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
