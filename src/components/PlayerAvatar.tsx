"use client";
import { useState } from 'react';
import { generateAvatar } from '@/ai/flows/ai-generate-avatar';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface PlayerAvatarProps {
  playerName: string;
  onAvatarGenerated: (avatarDataUri: string) => void;
}

export default function PlayerAvatar({ playerName, onAvatarGenerated }: PlayerAvatarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateAvatar = async () => {
    if (!playerName) {
      toast({
        title: "Enter a Name",
        description: "Please enter your player name first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setAvatarDataUri(null);
    try {
      const res = await generateAvatar({ playerName });
      setAvatarDataUri(res.avatarDataUri);
      onAvatarGenerated(res.avatarDataUri);
    } catch (error) {
      console.error("Failed to generate avatar:", error);
      toast({
        title: "Error",
        description: "Could not generate an avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="w-24 h-24 rounded-full" />
        ) : (
          <Avatar className="w-24 h-24">
            {avatarDataUri ? (
              <AvatarImage src={avatarDataUri} alt={`${playerName}'s avatar`} />
            ): null}
            <AvatarFallback className="text-3xl">
                {playerName ? playerName.charAt(0).toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <Button onClick={handleGenerateAvatar} disabled={isLoading || !playerName} type="button" variant="outline">
        <Wand2 className="mr-2 h-4 w-4" />
        {isLoading ? 'Generating Avatar...' : 'Generate AI Avatar'}
      </Button>
    </div>
  );
}
