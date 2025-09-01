'use server';
/**
 * @fileOverview Suggests new minigame ideas to the player.
 *
 * - suggestMinigame - A function that suggests new minigame ideas.
 * - SuggestMinigameInput - The input type for the suggestMinigame function.
 * - SuggestMinigameOutput - The return type for the suggestMinigame function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMinigameInputSchema = z.object({
  gameHistory: z
    .array(z.string())
    .describe('An array of the player history, including the game names.'),
});
export type SuggestMinigameInput = z.infer<typeof SuggestMinigameInputSchema>;

const SuggestMinigameOutputSchema = z.object({
  suggestion: z.string().describe('A suggestion for a new minigame idea.'),
});
export type SuggestMinigameOutput = z.infer<typeof SuggestMinigameOutputSchema>;

export async function suggestMinigame(input: SuggestMinigameInput): Promise<SuggestMinigameOutput> {
  return suggestMinigameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMinigamePrompt',
  input: {schema: SuggestMinigameInputSchema},
  output: {schema: SuggestMinigameOutputSchema},
  prompt: `You are a creative game designer who is an expert in retro arcade games. Based on the player's game history, suggest a new minigame idea that would be fun and appropriate for them. Ensure that the game idea aligns well with the retro arcade theme.

Here is the game history: {{{gameHistory}}}

Suggestion:`,
});

const suggestMinigameFlow = ai.defineFlow(
  {
    name: 'suggestMinigameFlow',
    inputSchema: SuggestMinigameInputSchema,
    outputSchema: SuggestMinigameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
