/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RemoveMessage } from '@langchain/core/messages';
import { MemorySaver, REMOVE_ALL_MESSAGES } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, createMiddleware, tool } from 'langchain';
import z from 'zod';

import { db } from '@src/database';

// --- CONFIGURATION ---
const systemPrompt = `
You are a Senior VC Analyst who has extensive experience with Slush.
GOAL: Interview the founder, grade their startup, and provide constructive feedback on how they can prepare for Slush to maximise their success attending Slush.

PROCESS:
1. Review the chat history if there is any.
2. If you don't know the Product, Traction, or Secret Sauce yet -> ASK 1 question.
3. If the user has new info about a startup that you have previously evaluated, update your memory of the company and make an updated analysis.
4. If you have enough info -> STOP ASKING. Call 'submit_evaluation'. After the tool is called successfully, tell the user your analysis of the user's company or idea in current form, what can be improved, what they can do during Slush.


RULES:
- Be concise.
- Be critical.
- Do NOT say "I will now evaluate." Just call the tool.
`;

const EvaluationSchema = z.object({
  startup_name: z.string().describe('Name of the startup'),
  industry: z.string().describe('The industry category'),
  analysis: z
    .string()
    .describe(
      'A 2-sentence summary of why you gave this evaluation. Be honest and critical.',
    ),
});

const model = new ChatOpenAI({
  model: 'gpt-5.2-chat-latest',
  apiKey: process.env.OPENAI_API_KEY,
});

const submitEvaluationTool = tool(
  async (
    { startup_name, industry, analysis }: z.infer<typeof EvaluationSchema>,
    config,
  ) => {
    try {
      const userId = config.configurable?.user_id;

      const existingApplication = await db
        .selectFrom('application')
        .select('startup_name')
        .where('startup_name', '=', startup_name)
        .execute();

      if (existingApplication.length > 0) {
        await db
          .updateTable('application')
          .set({
            user_id: Number(userId),
            startup_name,
            industry,
            analysis,
          })
          .where('startup_name', '=', startup_name)
          .execute();
      } else {
        await db
          .insertInto('application')
          .values({
            user_id: Number(userId),
            startup_name,
            industry,
            analysis,
          })
          .execute();
      }

      return JSON.stringify({
        status: 'success',
        msg: 'Assessment saved to database.',
      });
    } catch (e: any) {
      return `Error saving application: ${e.message}`;
    }
  },
  {
    name: 'submit_evaluation',
    description:
      'Saves the startup evaluation. Use this ONLY when you have asked enough questions.',
    schema: EvaluationSchema,
  },
);

const checkpointer = new MemorySaver();

const trimMessages = createMiddleware({
  name: 'TrimMessages',
  beforeModel: (state) => {
    const messages = state.messages;

    if (messages.length <= 12) {
      return;
    }

    const recentMessages =
      messages.length % 2 === 0 ? messages.slice(-12) : messages.slice(-13);
    const newMessages = [...recentMessages];

    return {
      messages: [
        new RemoveMessage({ id: REMOVE_ALL_MESSAGES }),
        ...newMessages,
      ],
    };
  },
});

export const agent = createAgent({
  model,
  tools: [submitEvaluationTool],
  checkpointer,
  systemPrompt,
  middleware: [trimMessages],
});
