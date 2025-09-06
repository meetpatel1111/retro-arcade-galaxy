'use server';
/**
 * @fileOverview Generates a word for a hangman game.
 *
 * - generateHangmanWord - A function that returns a word for the game.
 * - GenerateHangmanWordInput - The input type for the generateHangmanWord function.
 * - GenerateHangmanWordOutput - The return type for the generateHangmanWord function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHangmanWordInputSchema = z.object({
  difficulty: z
    .enum(['beginner', 'intermediate', 'expert'])
    .describe('The difficulty level, which determines the complexity of the word.'),
});
export type GenerateHangmanWordInput = z.infer<typeof GenerateHangmanWordInputSchema>;

const GenerateHangmanWordOutputSchema = z.object({
  word: z.string().describe('The generated word for the hangman game.'),
});
export type GenerateHangmanWordOutput = z.infer<typeof GenerateHangmanWordOutputSchema>;

export async function generateHangmanWord(
  input: GenerateHangmanWordInput
): Promise<GenerateHangmanWordOutput> {
  return generateHangmanWordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHangmanWordPrompt',
  input: { schema: GenerateHangmanWordInputSchema },
  output: { schema: GenerateHangmanWordOutputSchema },
  prompt: `Generate a single, common English word appropriate for a hangman game.

Difficulty: {{{difficulty}}}

- beginner: 4-6 letters, simple word (e.g., house, game, apple)
- intermediate: 6-8 letters, more complex word (e.g., player, arcade, puzzle)
- expert: 8-12 letters, challenging word (e.g., joystick, keyboard, algorithm)

The word should not be a proper noun and should only contain letters.
`,
});

const generateHangmanWordFlow = ai.defineFlow(
  {
    name: 'generateHangmanWordFlow',
    inputSchema: GenerateHangmanWordInputSchema,
    outputSchema: GenerateHangmanWordOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate word.');
    }
    
    return {
      word: output.word.toLowerCase(),
    };
  }
);
