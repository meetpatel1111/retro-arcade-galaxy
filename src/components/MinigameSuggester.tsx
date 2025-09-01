"use client";
import { useState } from 'react';
import { suggestMinigame } from '@/ai/flows/ai-minigame-suggestion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Lightbulb } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

export default function MinigameSuggester() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [gameHistory] = useLocalStorage<string[]>('game-history', ['Memory Match', 'Puzzle']);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSuggestGame = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const res = await suggestMinigame({ gameHistory });
      setSuggestion(res.suggestion);
    } catch (error) {
      console.error("Failed to suggest minigame:", error);
      toast({
        title: "Error",
        description: "Could not get a suggestion. Please try again.",
        variant: "destructive"
      });
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Lightbulb className="mr-2 h-5 w-5" />
          Get AI Game Idea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Minigame Idea!</DialogTitle>
          <DialogDescription>
            Based on your play history, here's a fresh idea from our AI game designer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[100px]">
          {isLoading && <p>Thinking of a cool game...</p>}
          {suggestion && (
             <div className="space-y-2 rounded-md border border-dashed p-4">
                <p className="text-primary">{suggestion}</p>
             </div>
          )}
        </div>
        <DialogFooter className='sm:justify-between gap-2'>
            <Button onClick={handleSuggestGame} disabled={isLoading}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Get another idea'}
            </Button>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                Close
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
