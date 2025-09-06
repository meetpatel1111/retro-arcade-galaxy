"use client";

import { useState } from 'react';
import { generateLegendVideo } from '@/ai/flows/ai-generate-legend-video';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Film, Wand2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface LegendVideoGeneratorProps {
  playerName: string;
  gameName: string;
  score: number;
  onClose: () => void;
}

export default function LegendVideoGenerator({ playerName, gameName, score, onClose }: LegendVideoGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateVideo = async () => {
    setIsLoading(true);
    setVideoDataUri(null);
    try {
      const res = await generateLegendVideo({ playerName, gameName, score });
      setVideoDataUri(res.videoDataUri);
    } catch (error) {
      console.error("Failed to generate legend video:", error);
      toast({
        title: "Error Generating Video",
        description: "Could not create your legend video. The AI might be busy. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Film /> Create Your Legend Video</DialogTitle>
        <DialogDescription>
          Immortalize your high score! Let the AI create a short, epic video of your legendary moment.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 min-h-[200px] flex items-center justify-center">
        {isLoading && (
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-64 h-36 rounded-lg" />
                <p className="text-sm text-muted-foreground animate-pulse">Rendering your epic moment... this can take a minute.</p>
            </div>
        )}
        {videoDataUri && (
             <div className="space-y-4">
                <video controls src={videoDataUri} className="w-full rounded-lg" />
                <Button asChild className="w-full">
                    <a href={videoDataUri} download={`legend_of_${playerName}.mp4`}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Video
                    </a>
                </Button>
             </div>
        )}
        {!isLoading && !videoDataUri && (
             <Button onClick={handleGenerateVideo} size="lg">
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
