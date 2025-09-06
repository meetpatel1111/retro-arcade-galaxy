'use server';
/**
 * @fileOverview Generates an image for the sliding puzzle game and slices it into tiles.
 *
 * - generatePuzzleImage - A function that returns a main image and sliced tile images.
 * - GeneratePuzzleImageOutput - The return type for the generatePuzzleImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import sharp from 'sharp';

const GeneratePuzzleImageOutputSchema = z.object({
  mainImageUri: z
    .string()
    .describe(
      "The full generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
  tiles: z.array(z.string()).describe('An array of 9 base64 encoded image tiles.'),
});
export type GeneratePuzzleImageOutput = z.infer<typeof GeneratePuzzleImageOutputSchema>;

export async function generatePuzzleImage(): Promise<GeneratePuzzleImageOutput> {
  return generatePuzzleImageFlow();
}

const generatePuzzleImageFlow = ai.defineFlow(
  {
    name: 'generatePuzzleImageFlow',
    inputSchema: z.void(),
    outputSchema: GeneratePuzzleImageOutputSchema,
  },
  async () => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: `Generate a vibrant, 8-bit pixel art image suitable for a 3x3 sliding puzzle. The image should feature a classic retro arcade theme, like a spaceship, an alien, a joystick, or a fantasy character. The composition should be interesting and not too uniform to make the puzzle solvable. Image dimensions should be 300x300 pixels.`,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed.');
    }

    const mainImageUri = media.url;
    const base64Data = mainImageUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image metadata.');
    }

    const tileWidth = Math.floor(metadata.width / 3);
    const tileHeight = Math.floor(metadata.height / 3);
    const tiles: string[] = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i === 2 && j === 2) continue; // Skip the last tile

            const tileBuffer = await image
                .clone()
                .extract({ left: j * tileWidth, top: i * tileHeight, width: tileWidth, height: tileHeight })
                .png()
                .toBuffer();
            
            tiles.push(`data:image/png;base64,${tileBuffer.toString('base64')}`);
        }
    }
    
    return { mainImageUri, tiles };
  }
);
