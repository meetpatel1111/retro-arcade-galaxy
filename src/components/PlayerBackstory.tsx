"use client";
import { useState } from 'react';
import { generatePlayerBackstory } from '@/ai/flows/ai-player-backstory';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { ScrollText, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlayerBackstoryProps {
  playerName: string;
  gameName: string;
}

export default function PlayerBackstory({ playerName, gameName }: PlayerBackstoryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [backstory, setBackstory] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleGetBackstory = async () => {
    setIsLoading(true);
    setBackstory(null);
    try {
      const res = await generatePlayerBackstory({ playerName, gameName });
      setBackstory(res.backstory);
    } catch (error) {
      console.error("Failed to get backstory:", error);
      toast({
        title: "Error",
        description: "Could not generate a backstory. Please try again.",
        variant: "destructive"
      });
      setOpen(false); // Close dialog on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setBackstory(null); // Reset when closing
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleGetBackstory}>
          <ScrollText className="mr-2 h-4 w-4" />
          Legend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>The Legend of {playerName}</DialogTitle>
          <DialogDescription>
            A tale from the arcade archives, chronicling their prowess in {gameName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[120px]">
          {isLoading && <p>Unearthing the ancient scrolls...</p>}
          {backstory && (
             <div className="space-y-2 rounded-md border border-dashed p-4 text-primary bg-card/50">
                <p>{backstory}</p>
             </div>
          )}
        </div>
        <DialogFooter className='sm:justify-between gap-2'>
            <Button onClick={handleGetBackstory} disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Weaving tale...' : 'Spin a New Tale'}
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
