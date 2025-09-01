
"use client";
import { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { generateGameBanter } from '@/ai/flows/ai-game-banter';

interface AiBanterBoxProps {
    gameOutcome: 'win' | 'loss' | 'draw' | null;
    gameName: string;
}

export default function AiBanterBox({ gameOutcome, gameName }: AiBanterBoxProps) {
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
                const banterResponse = await generateGameBanter({ gameName, gameOutcome });
                
                setBanter(banterResponse.banter);
                
                const audio = new Audio(banterResponse.audioDataUri);
                audio.play();
                audioRef.current = audio;

              } catch (err) {
                console.error("Error generating banter:", err);
                setBanter("Oops! My circuits are buzzing. Try again!");
              } finally {
                setIsLoading(false);
              }
            };
            getBanter();
        }

        if (!gameOutcome) {
            hasFetched.current = false;
        }

    }, [gameOutcome, gameName]);

    if (!gameOutcome) return null;

    return (
        <div className="mt-4 w-full max-w-sm text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                <Bot /> Game Master
            </div>
            <div className="mt-2 min-h-[4rem] rounded-md border border-dashed border-accent/30 bg-card/50 p-3 text-sm text-muted-foreground">
                {isLoading && "Thinking of something witty..."}
                {banter}
            </div>
        </div>
    );
}
