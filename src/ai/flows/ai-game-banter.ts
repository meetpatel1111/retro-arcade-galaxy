'use server';
/**
 * @fileOverview Generates retro arcade-style banter from an AI Game Master, including audio.
 *
 * - generateGameBanter - A function that creates commentary for a game's outcome with audio.
 * - GenerateGameBanterInput - The input type for the generateGameBanter function.
 * - GenerateGameBanterOutput - The return type for the generateGameBanter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { textToSpeech } from './ai-text-to-speech';

const GenerateGameBanterInputSchema = z.object({
  gameName: z.string().describe('The name of the game that was played.'),
  gameOutcome: z
    .enum(['win', 'loss', 'draw'])
    .describe('The outcome of the game from the player perspective.'),
});
export type GenerateGameBanterInput = z.infer<
  typeof GenerateGameBanterInputSchema
>;

const GenerateGameBanterOutputSchema = z.object({
  banter: z
    .string()
    .describe('The generated banter from the AI Game Master.'),
  audioDataUri: z
    .string()
    .describe(
      "The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type GenerateGameBanterOutput = z.infer<
  typeof GenerateGameBanterOutputSchema
>;

export async function generateGameBanter(
  input: GenerateGameBanterInput
): Promise<GenerateGameBanterOutput> {
  return generateGameBanterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGameBanterPrompt',
  input: {schema: z.object({ gameName: z.string(), gameOutcome: z.string() })},
  output: {schema: z.object({ banter: z.string() })},
  prompt: `You are an enthusiastic and slightly cheesy retro arcade AI Game Master from the 80s. Your job is to provide some fun, thematic commentary after a player finishes a game.

Game: {{{gameName}}}
Outcome for the player: {{{gameOutcome}}}

Based on the game and the outcome, generate a short, punchy, and fun line of commentary. Keep it clean and encouraging, even if the player lost. Think classic arcade vibes!

Examples:
- (Tic-Tac-Toe, win): "A flawless victory! You've got the X-factor!"
- (Tic-Tac-Toe, loss): "The machine triumphs this time, but the motherboard of a champion never shorts out! Try again!"
- (Pong, win): "You're a paddle master! That ball didn't know what hit it!"
- (Snake, loss): "Crashed and burned! Even digital serpents need to watch where they're going."
`,
});

const generateGameBanterFlow = ai.defineFlow(
  {
    name: 'generateGameBanterFlow',
    inputSchema: GenerateGameBanterInputSchema,
    outputSchema: GenerateGameBanterOutputSchema,
  },
  async input => {
    // Run text generation and TTS in parallel
    const banterPromise = prompt(input);
    const [banterResult] = await Promise.all([banterPromise]);
    
    if (!banterResult.output) {
      throw new Error("Failed to generate banter text.");
    }
    
    const { banter } = banterResult.output;
    
    const audioResult = await textToSpeech({ text: banter });

    return {
      banter,
      audioDataUri: audioResult.audioDataUri,
    };
  }
);