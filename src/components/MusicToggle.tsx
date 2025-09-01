"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Music, VolumeX } from 'lucide-react';

export default function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This is a placeholder as audio files cannot be added.
    // In a real scenario, you would use: new Audio('/music/background.mp3');
    if (typeof window !== "undefined") {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const pseudoAudio = {
        play: () => { 
          if(audioContext.state === 'suspended') audioContext.resume() 
        },
        pause: () => {
          if(audioContext.state === 'running') audioContext.suspend()
        },
        loop: true,
      } as unknown as HTMLAudioElement;

      audioRef.current = pseudoAudio;
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    const nextIsPlaying = !isPlaying;
    if (nextIsPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(nextIsPlaying);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleMusic} aria-label="Toggle Music">
      {isPlaying ? <Music className="h-6 w-6 text-accent" /> : <VolumeX className="h-6 w-6" />}
    </Button>
  );
}
