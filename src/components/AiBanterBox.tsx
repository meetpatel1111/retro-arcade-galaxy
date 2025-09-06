
"use client";
import { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquareText } from 'lucide-react';
import { generateGameBanter } from '@/ai/flows/ai-game-banter';

interface AiBanterBoxProps {
    gameOutcome: 'win' | 'loss' | 'draw' | null;
    gameName: string;
    score?: number;
}

export default function AiBanterBox({ gameOutcome, gameName, score }: AiBanterBoxProps) {
    const [banter, setBanter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (gameOutcome && !hasFetched.current) {
            hasFetched.current = true;
            setIsLoading(true);
            setBanter(null);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }

            const getBanter = async () => {
              try {
                const banterResponse = await generateGameBanter({ gameName, gameOutcome, playerScore: score });
                
                setBanter(banterResponse.banter);
                
                if (banterResponse.audioDataUri) {
                  const audio = new Audio(banterResponse.audioDataUri);
                  audio.play();
                  audioRef.current = audio;
                }

              } catch (err: any) {
                console.error("Error generating banter:", err);
                // Check for rate limit error and handle gracefully
                if (err.message && err.message.includes('429')) {
                    setBanter("My voice circuits are recharging! You'll have to read this one yourself.");
                } else {
                    setBanter("Oops! My circuits are buzzing. Try again!");
                }
              } finally {
                setIsLoading(false);
              }
            };
            getBanter();
        }

        if (!gameOutcome) {
            hasFetched.current = false;
        }

    }, [gameOutcome, gameName, score]);

    if (!gameOutcome) return null;

    return (
        <div className="mt-4 w-full max-w-sm text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                <MessageSquareText /> AI Commentary
            </div>
            <div className="mt-2 min-h-[4rem] rounded-md border border-dashed border-accent/30 bg-card/50 p-3 text-sm text-muted-foreground whitespace-pre-wrap text-left">
                {isLoading && "Thinking of something witty..."}
                {banter}
            </div>
        </div>
    );
}
