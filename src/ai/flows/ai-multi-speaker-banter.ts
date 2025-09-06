'use server';
/**
 * @fileOverview Generates a multi-speaker dialogue for game banter.
 *
 * - generateMultiSpeakerBanter - A function that returns a dialogue script.
 * - GenerateMultiSpeakerBanterInput - The input type for the generateMultiSpeakerBanter function.
 * - GenerateMultiSpeakerBanterOutput - The return type for the generateMultiSpeakerBanter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMultiSpeakerBanterInputSchema = z.object({
  gameName: z.string().describe('The name of the game that was played.'),
  gameOutcome: z
    .enum(['win', 'loss', 'draw'])
    .describe('The outcome of the game from the player perspective.'),
  playerScore: z.number().optional().describe('The final score of the player.'),
});
export type GenerateMultiSpeakerBanterInput = z.infer<
  typeof GenerateMultiSpeakerBanterInputSchema
>;

const GenerateMultiSpeakerBanterOutputSchema = z.object({
  dialogue: z
    .string()
    .describe('The generated dialogue script between two speakers, formatted with "Speaker1: ..." and "Speaker2: ...".'),
});
export type GenerateMultiSpeakerBanterOutput = z.infer<
  typeof GenerateMultiSpeakerBanterOutputSchema
>;

export async function generateMultiSpeakerBanter(
  input: GenerateMultiSpeakerBanterInput
): Promise<GenerateMultiSpeakerBanterOutput> {
  return generateMultiSpeakerBanterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMultiSpeakerBanterPrompt',
  input: { schema: GenerateMultiSpeakerBanterInputSchema },
  output: { schema: GenerateMultiSpeakerBanterOutputSchema },
  prompt: `You are a scriptwriter for a retro arcade. Your task is to write a short, punchy dialogue between two AI commentators after a player finishes a game.

- Speaker1 is the "Game Master," an enthusiastic and slightly cheesy retro AI from the 80s.
- Speaker2 is the "Sidekick," a witty, slightly sarcastic, and modern AI.

The dialogue should be a maximum of 2-4 lines total. It must be formatted with "Speaker1: " and "Speaker2: " prefixes.

Game: {{{gameName}}}
Outcome for the player: {{{gameOutcome}}}
{{#if playerScore}}Player Score: {{{playerScore}}}{{/if}}

Based on the game and outcome, generate a fun, thematic conversation.

Example for a "win" in Tic-Tac-Toe:
Speaker1: A flawless victory! You've got the X-factor!
Speaker2: I've run the numbers. That was statistically improbable. Well done, human.

Example for a "loss" in Snake:
Speaker1: Even digital serpents need to watch where they're going! A valiant effort!
Speaker2: Note to self: running into yourself is a suboptimal strategy.

Now, write the dialogue for the given game scenario.
`,
});

const generateMultiSpeakerBanterFlow = ai.defineFlow(
  {
    name: 'generateMultiSpeakerBanterFlow',
    inputSchema: GenerateMultiSpeakerBanterInputSchema,
    outputSchema: GenerateMultiSpeakerBanterOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate dialogue.');
    }
    return output;
  }
);
