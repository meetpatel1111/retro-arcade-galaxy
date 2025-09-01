'use server';
/**
 * @fileOverview Generates a word for a word scramble game.
 *
 * - generateScrambledWord - A function that returns a word and its scrambled version.
 * - GenerateScrambledWordInput - The input type for the generateScrambledWord function.
 * - GenerateScrambledWordOutput - The return type for the generateScrambledWord function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateScrambledWordInputSchema = z.object({
  difficulty: z
    .enum(['beginner', 'intermediate', 'expert'])
    .describe('The difficulty level, which determines the length of the word.'),
});
export type GenerateScrambledWordInput = z.infer<typeof GenerateScrambledWordInputSchema>;

const GenerateScrambledWordOutputSchema = z.object({
  originalWord: z.string().describe('The original, unscrambled word.'),
  scrambledWord: z.string().describe('The scrambled version of the word.'),
});
export type GenerateScrambledWordOutput = z.infer<typeof GenerateScrambledWordOutputSchema>;

export async function generateScrambledWord(
  input: GenerateScrambledWordInput
): Promise<GenerateScrambledWordOutput> {
  return generateScrambledWordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScrambledWordPrompt',
  input: { schema: GenerateScrambledWordInputSchema },
  output: { schema: z.object({ word: z.string() }) },
  prompt: `Generate a single, common English word appropriate for a word scramble game.

Difficulty: {{{difficulty}}}

- beginner: 4-5 letters
- intermediate: 6-7 letters
- expert: 8-9 letters

The word should not be a proper noun.
`,
});

function scramble(word: string): string {
  let scrambled = '';
  let original = word;
  while (original.length > 0) {
    const i = Math.floor(Math.random() * original.length);
    scrambled += original[i];
    original = original.substring(0, i) + original.substring(i + 1);
  }
  // Ensure the scrambled word is not the same as the original
  if (scrambled === word) {
    return scramble(word);
  }
  return scrambled;
}

const generateScrambledWordFlow = ai.defineFlow(
  {
    name: 'generateScrambledWordFlow',
    inputSchema: GenerateScrambledWordInputSchema,
    outputSchema: GenerateScrambledWordOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate word.');
    }
    const originalWord = output.word.toLowerCase();
    const scrambledWord = scramble(originalWord);

    return {
      originalWord,
      scrambledWord,
    };
  }
);
