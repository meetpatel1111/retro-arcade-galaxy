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
import PlayerAvatar from './PlayerAvatar';
import LegendVideoGenerator from './LegendVideoGenerator';

interface HighScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  gameName: string;
  onSave: (playerName: string, avatarDataUri?: string) => void;
}

export default function HighScoreDialog({ open, onOpenChange, score, gameName, onSave }: HighScoreDialogProps) {
  const [playerName, setPlayerName] = useState("");
  const [avatarDataUri, setAvatarDataUri] = useState<string | undefined>();
  const [step, setStep] = useState(1);

  const handleSave = () => {
    onSave(playerName.trim() || "Player", avatarDataUri);
    setStep(2); // Move to video generation step
  };

  const handleClose = () => {
    setPlayerName("");
    setAvatarDataUri(undefined);
    setStep(1);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 && (
          <>
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
                <PlayerAvatar playerName={playerName} onAvatarGenerated={setAvatarDataUri} />
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
              <Button onClick={handleSave}>Save & Continue</Button>
            </DialogFooter>
          </>
        )}
        {step === 2 && (
            <LegendVideoGenerator 
                playerName={playerName || "Player"} 
                gameName={gameName} 
                score={score}
                onClose={handleClose}
            />
        )}
      </DialogContent>
    </Dialog>
  );
}
