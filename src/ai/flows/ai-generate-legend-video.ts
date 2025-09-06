'use server';
/**
 * @fileOverview Generates a short video clip representing a player's "legendary moment".
 *
 * - generateLegendVideo - A function that returns a video data URI.
 * - GenerateLegendVideoInput - The input type for the generateLegendVideo function.
 * - GenerateLegendVideoOutput - The return type for the generateLegendVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GenerateLegendVideoInputSchema = z.object({
  playerName: z.string().describe('The name of the player.'),
  gameName: z.string().describe('The name of the high score was achieved in.'),
  score: z.number().describe('The score achieved by the player.'),
});
export type GenerateLegendVideoInput = z.infer<typeof GenerateLegendVideoInputSchema>;

const GenerateLegendVideoOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateLegendVideoOutput = z.infer<typeof GenerateLegendVideoOutputSchema>;

export async function generateLegendVideo(
  input: GenerateLegendVideoInput
): Promise<GenerateLegendVideoOutput> {
  return generateLegendVideoFlow(input);
}

const generateLegendVideoFlow = ai.defineFlow(
  {
    name: 'generateLegendVideoFlow',
    inputSchema: GenerateLegendVideoInputSchema,
    outputSchema: GenerateLegendVideoOutputSchema,
  },
  async ({ playerName, gameName, score }) => {
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-image-preview'),
        prompt: `Generate an epic, cinematic, 8-bit retro arcade style image celebrating the legendary moment for a player named "${playerName}" who just achieved a high score of ${score} in the game "${gameName}". The image should be dynamic, exciting, and feel like a classic video game poster.`,
        config: {
            responseModalities: ['IMAGE'],
        },
    });

    if (!media) {
      throw new Error('Image generation failed.');
    }

    return { imageDataUri: media.url };
  }
);
