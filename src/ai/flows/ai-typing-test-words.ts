'use server';
/**
 * @fileOverview Generates a list of words for a typing test game.
 *
 * - generateTypingTestWords - A function that returns a list of words.
 * - GenerateTypingTestWordsInput - The input type for the generateTypingTestWords function.
 * - GenerateTypingTestWordsOutput - The return type for the generateTypingTestWords function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTypingTestWordsInputSchema = z.object({
  difficulty: z
    .enum(['beginner', 'intermediate', 'expert'])
    .describe('The difficulty level, which determines the complexity of the words.'),
  count: z.number().min(10).max(100).describe('The number of words to generate.'),
});
export type GenerateTypingTestWordsInput = z.infer<typeof GenerateTypingTestWordsInputSchema>;

const GenerateTypingTestWordsOutputSchema = z.object({
  words: z.array(z.string()).describe('The list of generated words for the typing test.'),
});
export type GenerateTypingTestWordsOutput = z.infer<typeof GenerateTypingTestWordsOutputSchema>;

export async function generateTypingTestWords(
  input: GenerateTypingTestWordsInput
): Promise<GenerateTypingTestWordsOutput> {
  return generateTypingTestWordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTypingTestWordsPrompt',
  input: { schema: GenerateTypingTestWordsInputSchema },
  output: { schema: GenerateTypingTestWordsOutputSchema },
  prompt: `Generate a list of {{{count}}} common English words appropriate for a typing test.

Difficulty: {{{difficulty}}}

- beginner: 4-6 letters, very common words.
- intermediate: 5-8 letters, slightly more complex words.
- expert: 6-10 letters, may include less common words or simple punctuation.

The words should only contain lowercase letters.
`,
});

const generateTypingTestWordsFlow = ai.defineFlow(
  {
    name: 'generateTypingTestWordsFlow',
    inputSchema: GenerateTypingTestWordsInputSchema,
    outputSchema: GenerateTypingTestWordsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate words.');
    }
    
    return {
      words: output.words.map(w => w.toLowerCase()),
    };
  }
);
