import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const ChatSchema = z.object({
  message: z.string(),
});
