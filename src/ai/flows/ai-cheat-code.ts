'use server';
/**
 * @fileOverview Generates a creative "cheat code" for a given game.
 *
 * - generateCheatCode - A function that returns a cheat code idea.
 * - GenerateCheatCodeInput - The input type for the generateCheatCode function.
 * - GenerateCheatCodeOutput - The return type for the generateCheatCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCheatCodeInputSchema = z.object({
  gameName: z.string().describe('The name of the game for which to generate a cheat code.'),
});
export type GenerateCheatCodeInput = z.infer<typeof GenerateCheatCodeInputSchema>;

const GenerateCheatCodeOutputSchema = z.object({
  cheatCode: z.string().describe('A creative, retro-style cheat code idea for the game.'),
});
export type GenerateCheatCodeOutput = z.infer<typeof GenerateCheatCodeOutputSchema>;

export async function generateCheatCode(
  input: GenerateCheatCodeInput
): Promise<GenerateCheatCodeOutput> {
  return generateCheatCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCheatCodePrompt',
  input: { schema: GenerateCheatCodeInputSchema },
  output: { schema: GenerateCheatCodeOutputSchema },
  prompt: `You are a retro arcade game master. A player wants a fun, creative "cheat code" for a game. 
  
Game: {{{gameName}}}

Generate a short, imaginative cheat code idea. It should sound like it's from a classic 80s arcade game. Don't just give a power-up, give it a fun name or theme.

Examples:
- For Snake: "Activate 'Ghost Mode' to pass through your own tail for 10 seconds!"
- For Pong: "Enable 'Fireball Mode' to make the ball speed up after every volley!"
- For Space Invaders: "Unlock 'Triple Shot' for a limited time!"
`,
});

const generateCheatCodeFlow = ai.defineFlow(
  {
    name: 'generateCheatCodeFlow',
    inputSchema: GenerateCheatCodeInputSchema,
    outputSchema: GenerateCheatCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate cheat code.');
    }
    return output;
  }
);
