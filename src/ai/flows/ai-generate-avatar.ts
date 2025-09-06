'use server';
/**
 * @fileOverview Generates a pixel art avatar for a player.
 *
 * - generateAvatar - A function that returns a pixel art avatar image.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GenerateAvatarInputSchema = z.object({
  playerName: z.string().describe('The name or handle of the player.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      "The generated pixel art avatar as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(
  input: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async ({ playerName }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: `Generate a retro 8-bit pixel art avatar for a video game character named "${playerName}". The avatar should be a headshot, suitable for a leaderboard profile picture. It should be colorful and have a classic arcade game feel. The background should be a simple, solid color.`,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed.');
    }

    return { avatarDataUri: media.url };
  }
);
