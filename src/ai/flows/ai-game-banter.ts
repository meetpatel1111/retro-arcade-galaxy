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
import { generateMultiSpeakerBanter } from './ai-multi-speaker-banter';

const GenerateGameBanterInputSchema = z.object({
  gameName: z.string().describe('The name of the game that was played.'),
  gameOutcome: z
    .enum(['win', 'loss', 'draw'])
    .describe('The outcome of the game from the player perspective.'),
  playerScore: z.number().optional().describe('The final score of the player.'),
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
    .optional()
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

const generateGameBanterFlow = ai.defineFlow(
  {
    name: 'generateGameBanterFlow',
    inputSchema: GenerateGameBanterInputSchema,
    outputSchema: GenerateGameBanterOutputSchema,
  },
  async input => {
    // Generate the multi-speaker dialogue script first
    const banterResult = await generateMultiSpeakerBanter(input);
    
    if (!banterResult.dialogue) {
      throw new Error("Failed to generate banter text.");
    }
    
    const { dialogue } = banterResult;
    
    try {
      // Pass the multi-speaker script to the updated TTS flow
      const audioResult = await textToSpeech({ text: dialogue });
      return {
        banter: dialogue.replace(/Speaker\d: /g, '\n'), // Format for display
        audioDataUri: audioResult.audioDataUri,
      };
    } catch (err) {
      console.error("TTS generation failed, returning text only.", err);
      // Return banter without audio if TTS fails
      return {
        banter: dialogue.replace(/Speaker\d: /g, '\n'),
      };
    }
  }
);
