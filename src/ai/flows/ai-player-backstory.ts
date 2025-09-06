'use server';
/**
 * @fileOverview Generates a creative backstory for a player.
 *
 * - generatePlayerBackstory - A function that returns a player backstory.
 * - GeneratePlayerBackstoryInput - The input type for the generatePlayerBackstory function.
 * - GeneratePlayerBackstoryOutput - The return type for the generatePlayerBackstory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePlayerBackstoryInputSchema = z.object({
  playerName: z.string().describe('The name of the player.'),
  gameName: z.string().describe('The name of the game the player is known for.'),
});
export type GeneratePlayerBackstoryInput = z.infer<typeof GeneratePlayerBackstoryInputSchema>;

const GeneratePlayerBackstoryOutputSchema = z.object({
  backstory: z.string().describe('A creative, retro-style backstory for the player.'),
});
export type GeneratePlayerBackstoryOutput = z.infer<typeof GeneratePlayerBackstoryOutputSchema>;

export async function generatePlayerBackstory(
  input: GeneratePlayerBackstoryInput
): Promise<GeneratePlayerBackstoryOutput> {
  return generatePlayerBackstoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlayerBackstoryPrompt',
  input: { schema: GeneratePlayerBackstoryInputSchema },
  output: { schema: GeneratePlayerBackstoryOutputSchema },
  prompt: `You are a legendary 80s arcade game master, weaving tales of the heroes who conquer the digital realms. A player needs a backstory.

Player Name: {{{playerName}}}
Famous Game: {{{gameName}}}

Generate a short, epic, and imaginative backstory for this player. It should sound like it's from the back of a classic video game box. Make them sound like an arcade legend.

Examples:
- For "Viper" in "Space Invaders": "Viper, the legendary pilot from the outer quadrants, is rumored to have learned to fly before they could walk. With reflexes honed by navigating asteroid fields, they are the last line of defense against the relentless alien swarm."
- For "Ghost" in "Snake": "They call them Ghost, a master of the digital serpent. Ghost navigates the grid with impossible precision, phasing through challenges others deem unbeatable. Some say they don't play the game, they become it."
- For "BOB" in "Pong": "Known only as BOB, this mysterious paddle master appeared one day and shattered every high score. No one knows where BOB came from, but their control over the digital court is the stuff of legends, a testament to pure skill."
`,
});

const generatePlayerBackstoryFlow = ai.defineFlow(
  {
    name: 'generatePlayerBackstoryFlow',
    inputSchema: GeneratePlayerBackstoryInputSchema,
    outputSchema: GeneratePlayerBackstoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate player backstory.');
    }
    return output;
  }
);
