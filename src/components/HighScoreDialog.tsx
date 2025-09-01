"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HighScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  gameName: string;
  onSave: (playerName: string) => void;
}

export default function HighScoreDialog({ open, onOpenChange, score, gameName, onSave }: HighScoreDialogProps) {
  const [playerName, setPlayerName] = useState("");

  const handleSave = () => {
    onSave(playerName.trim() || "Player");
    setPlayerName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New High Score!</DialogTitle>
          <DialogDescription>
            Congratulations! You've set a new high score for {gameName}.
            Enter your name to save it to the leaderboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className='text-center'>
                <p className='text-sm text-muted-foreground'>Your Score</p>
                <p className='text-4xl font-bold text-primary'>{score}</p>
            </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Score</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
