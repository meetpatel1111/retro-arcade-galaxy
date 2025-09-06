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
  gameName: z.string().describe('The name of the game the high score was achieved in.'),
  score: z.number().describe('The score achieved by the player.'),
});
export type GenerateLegendVideoInput = z.infer<typeof GenerateLegendVideoInputSchema>;

const GenerateLegendVideoOutputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "The generated video as a data URI. Expected format: 'data:video/mp4;base64,<encoded_data>'."
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
    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: `Generate a short, epic, cinematic, 8-bit retro arcade style video celebrating the legendary moment for a player named "${playerName}" who just achieved a high score of ${score} in the game "${gameName}". The video should be dynamic, exciting, and feel like a classic video game cutscene.`,
        config: {
            durationSeconds: 5,
            aspectRatio: '16:9',
        },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
        operation = await ai.checkOperation(operation);
        // Sleep for 5 seconds before checking again.
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) {
        throw new Error('Failed to generate video: ' + operation.error.message);
    }
    
    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video || !video.media?.url) {
        throw new Error('Failed to find the generated video');
    }

    // The media URL from Veo is a temporary download link. We need to fetch it and convert to a data URI.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(`${video.media.url}&key=${apiKey}`);
    
    if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
      throw new Error(`Failed to download video: ${videoDownloadResponse.statusText}`);
    }

    const videoBuffer = await videoDownloadResponse.buffer();
    const videoBase64 = videoBuffer.toString('base64');
    const videoDataUri = `data:video/mp4;base64,${videoBase64}`;

    return { videoDataUri };
  }
);
