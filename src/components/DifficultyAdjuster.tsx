"use client";
import { useState } from 'react';
import { adjustDifficulty } from '@/ai/flows/ai-difficulty-adjustment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DifficultyAdjusterProps {
  gameName: string;
  playerScore: number;
  currentDifficulty: string;
  onDifficultyChange: (newDifficulty: string) => void;
}

export default function DifficultyAdjuster({ gameName, playerScore, currentDifficulty, onDifficultyChange }: DifficultyAdjusterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ newDifficultyLevel: string; reason: string } | null>(null);
  const { toast } = useToast();

  const handleAdjustDifficulty = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await adjustDifficulty({ gameName, playerScore, difficultyLevel: currentDifficulty });
      setResult(res);
      onDifficultyChange(res.newDifficultyLevel);
      toast({
        title: "Difficulty Adjusted!",
        description: `New difficulty is now ${res.newDifficultyLevel}.`,
      });
    } catch (error) {
      console.error("Failed to adjust difficulty:", error);
       toast({
        title: "Error",
        description: "Could not adjust difficulty. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4 w-full max-w-sm border-accent/20 bg-background/50">
      <CardHeader>
        <CardTitle>AI Difficulty Adjustment</CardTitle>
        <CardDescription>Let AI balance the challenge for you.</CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <div className="space-y-2 rounded-md border border-dashed p-4">
            <p><strong>New Difficulty:</strong> <span className="text-primary">{result.newDifficultyLevel}</span></p>
            <p className="text-sm text-muted-foreground">{result.reason}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAdjustDifficulty} disabled={isLoading} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Analyzing Performance...' : 'Adjust with AI'}
        </Button>
      </CardFooter>
    </Card>
  );
}
