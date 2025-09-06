"use client";

import { useState } from 'react';
import { generateLegendVideo } from '@/ai/flows/ai-generate-legend-video';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Film, Wand2, Download, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';

interface LegendVideoGeneratorProps {
  playerName: string;
  gameName: string;
  score: number;
  onClose: () => void;
}

export default function LegendVideoGenerator({ playerName, gameName, score, onClose }: LegendVideoGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setImageDataUri(null);
    try {
      const res = await generateLegendVideo({ playerName, gameName, score });
      setImageDataUri(res.imageDataUri);
    } catch (error) {
      console.error("Failed to generate legend image:", error);
      toast({
        title: "Error Generating Image",
        description: "Could not create your legend image. The AI might be busy. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><ImageIcon /> Create Your Legend Image</DialogTitle>
        <DialogDescription>
          Immortalize your high score! Let the AI create an epic image of your legendary moment.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 min-h-[200px] flex items-center justify-center">
        {isLoading && (
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-64 h-36 rounded-lg" />
                <p className="text-sm text-muted-foreground animate-pulse">Rendering your epic moment...</p>
            </div>
        )}
        {imageDataUri && (
             <div className="space-y-4">
                <Image src={imageDataUri} alt={`Legend of ${playerName}`} width={400} height={225} className="rounded-lg" />
                <Button asChild className="w-full">
                    <a href={imageDataUri} download={`legend_of_${playerName}.png`}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                    </a>
                </Button>
             </div>
        )}
        {!isLoading && !imageDataUri && (
             <Button onClick={handleGenerate} size="lg">
                <Wand2 className="mr-2 h-5 w-5" />
                Generate My Legend
            </Button>
        )}
      </div>
      <DialogFooter>
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
