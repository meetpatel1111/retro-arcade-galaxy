'use server';

/**
 * @fileOverview A flow to dynamically adjust the game difficulty based on player performance.
 *
 * - adjustDifficulty - Adjusts the game difficulty based on player performance.
 * - AdjustDifficultyInput - The input type for the adjustDifficulty function.
 * - AdjustDifficultyOutput - The return type for the adjustDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDifficultyInputSchema = z.object({
  gameName: z.string().describe('The name of the game.'),
  playerScore: z.number().describe('The player score in the current game.'),
  difficultyLevel: z
    .string()
    .describe('The current difficulty level of the game.'),
  averageScore: z
    .number()
    .optional()
    .describe('The average score of the player for this game.'),
});
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;

const AdjustDifficultyOutputSchema = z.object({
  newDifficultyLevel: z
    .string()
    .describe(
      'The new difficulty level of the game, adjusted based on the player performance. Can be beginner, intermediate, or expert.'
    ),
  reason: z
    .string()
    .describe(
      'The reason for the difficulty level adjustment, based on player performance.'
    ),
});
export type AdjustDifficultyOutput = z.infer<typeof AdjustDifficultyOutputSchema>;

export async function adjustDifficulty(input: AdjustDifficultyInput): Promise<AdjustDifficultyOutput> {
  return adjustDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustDifficultyPrompt',
  input: {schema: AdjustDifficultyInputSchema},
  output: {schema: AdjustDifficultyOutputSchema},
  prompt: `You are an expert game designer, tasked with dynamically adjusting the difficulty of a game based on player performance.

Game Name: {{{gameName}}}
Player Score: {{{playerScore}}}
Current Difficulty Level: {{{difficultyLevel}}}
{{#if averageScore}}Average Score: {{{averageScore}}}{{/if}}

Based on the player's score and the current difficulty level, determine whether the difficulty should be increased, decreased, or remain the same.
Consider the average score of the player when making this determination, if available. Only choose between beginner, intermediate, or expert as difficulty level. 

Return the new difficulty level and the reason for the adjustment.
`,
});

const adjustDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyFlow',
    inputSchema: AdjustDifficultyInputSchema,
    outputSchema: AdjustDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
