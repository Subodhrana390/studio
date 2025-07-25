'use server';
/**
 * @fileOverview A conversational AI career counselor.
 *
 * - chatWithCounselor - A function to handle a chat message.
 * - ChatMessage - The type for a single chat message.
 * - ChatWithCounselorInput - The input type for the function.
 * - ChatWithCounselorOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {type MessageData} from '@genkit-ai/ai';
import {z} from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatWithCounselorInputSchema = z.object({
  history: z
    .array(ChatMessageSchema)
    .describe('The history of the conversation so far.'),
  newMessage: z.string().describe('The new message from the user.'),
});
export type ChatWithCounselorInput = z.infer<
  typeof ChatWithCounselorInputSchema
>;

const ChatWithCounselorOutputSchema = z.object({
  response: z
    .string()
    .describe("The AI counselor's response to the user's message."),
});
export type ChatWithCounselorOutput = z.infer<
  typeof ChatWithCounselorOutputSchema
>;

const systemPrompt = `You are ResumAI Bot, a friendly and knowledgeable AI career counselor. Your goal is to help students and job seekers with their career-related questions. Provide advice on job searching, resume writing, interview preparation, and career planning. Keep your responses encouraging, clear, and actionable. If you don't know an answer, say so honestly. Do not go outside the scope of career advice. Format your responses with markdown where it improves readability (e.g., lists, bolding).`;

export async function chatWithCounselor(
  input: ChatWithCounselorInput
): Promise<ChatWithCounselorOutput> {
  // Convert our simple ChatMessage array into the MessageData array Genkit expects
  const history: MessageData[] = input.history.map(msg => ({
    role: msg.role,
    content: [{text: msg.content}],
  }));

  // The 'prompt' parameter can accept the entire conversation history
  const fullPrompt: MessageData[] = [
    ...history,
    { role: 'user', content: [{ text: input.newMessage }] }
  ];

  // Use ai.generate for the conversation.
  // The system prompt provides overall instructions.
  // The prompt contains the full message history.
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    prompt: fullPrompt,
  });

  return {response: response.text};
}
