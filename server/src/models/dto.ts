import z from 'zod';

export const ChatDTOSchema = z.object({
  message: z.string(),
});

export const GetAnalysisDTOSchema = z.object({
  userId: z.string(),
  cursor: z.string().regex(/^\d+$/g),
});

export const RunAgentDTOSchema = z.object({
  ...ChatDTOSchema.shape,
  ...GetAnalysisDTOSchema.pick({ userId: true }).shape,
});

export const LoginDTOSchema = z.object({
  email: z.email(),
  password: z.string(),
});
