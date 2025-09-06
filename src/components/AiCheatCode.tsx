
"use client";
import { useState } from 'react';
import { generateCheatCode } from '@/ai/flows/ai-cheat-code';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AiCheatCodeProps {
  gameName: string;
}

export default function AiCheatCode({ gameName }: AiCheatCodeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cheatCode, setCheatCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleGetCheatCode = async () => {
    setIsLoading(true);
    setCheatCode(null);
    try {
      const res = await generateCheatCode({ gameName });
      setCheatCode(res.cheatCode);
    } catch (error) {
      console.error("Failed to get cheat code:", error);
      toast({
        title: "Error",
        description: "Could not get a cheat code. Please try again.",
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
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Get AI Cheat Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Cheat Code Activated!</DialogTitle>
          <DialogDescription>
            The Game Master has granted you a special power for {gameName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[80px]">
          {isLoading && <p>Hacking the mainframe...</p>}
          {cheatCode && (
             <div className="space-y-2 rounded-md border border-dashed p-4">
                <p className="text-primary">{cheatCode}</p>
             </div>
          )}
        </div>
        <DialogFooter className='sm:justify-between gap-2'>
            <Button onClick={handleGetCheatCode} disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Get Another'}
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
