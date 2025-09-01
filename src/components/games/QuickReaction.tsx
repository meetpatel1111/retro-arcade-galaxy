"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import HighScoreDialog from '../HighScoreDialog';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';

const GAME_ID = 'quick-reaction';
const GAME_NAME = 'Quick Reaction';

type GameState = 'idle' | 'waiting' | 'ready' | 'clicked' | 'too-soon';
type Difficulty = 'beginner' | 'intermediate' | 'expert';

const DIFFICULTY_SETTINGS = {
    beginner: { min: 2000, max: 5000 },
    intermediate: { min: 1000, max: 3000 },
    expert: { min: 500, max: 1500 },
};

export default function QuickReaction() {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    const { isHighScore, addHighScore } = useHighScores(GAME_ID);

    const score = reactionTime ? Math.max(0, 1000 - reactionTime) : 0;
    
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const startGame = () => {
        setGameState('waiting');
        setReactionTime(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        
        const {min, max} = DIFFICULTY_SETTINGS[difficulty];
        const waitTime = Math.random() * (max - min) + min;

        timerRef.current = setTimeout(() => {
            setGameState('ready');
            startTimeRef.current = Date.now();
        }, waitTime);
    };

    const handleClick = () => {
        if (gameState === 'waiting') {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            setGameState('too-soon');
        } else if (gameState === 'ready') {
            if (startTimeRef.current) {
                const endTime = Date.now();
                const finalTime = endTime - startTimeRef.current;
                setReactionTime(finalTime);
                const finalScore = Math.max(0, 1000 - finalTime);
                 if(isHighScore(finalScore)) {
                    setShowHighScoreDialog(true);
                }
            }
            setGameState('clicked');
        } else if (gameState === 'idle' || gameState === 'clicked' || gameState === 'too-soon') {
            startGame();
        }
    };
    
    const getScreenContent = () => {
        switch (gameState) {
            case 'waiting':
                return { text: 'Wait for Green...', color: 'bg-red-500/50' };
            case 'ready':
                return { text: 'CLICK NOW!', color: 'bg-green-500/50' };
            case 'too-soon':
                return { text: 'Too Soon! Click to try again.', color: 'bg-yellow-500/50' };
            case 'clicked':
                return { text: `${reactionTime}ms - Click to play again`, color: 'bg-blue-500/50' };
            default:
                 return { text: 'Click to Start', color: 'bg-card' };
        }
    };
    
    const { text, color } = getScreenContent();

    return (
        <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
                <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
                <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
                <div className="flex items-center gap-4">
                     <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
                    <div className="text-right min-w-[100px]">
                      <p>Score: <span className="font-bold text-accent">{score}</span></p>
                    </div>
                </div>
            </div>

            <div 
                onClick={handleClick} 
                className={cn("w-full h-80 rounded-lg flex items-center justify-center text-4xl font-bold cursor-pointer text-white", color)}
            >
                {text}
            </div>
             <HighScoreDialog 
                open={showHighScoreDialog} 
                onOpenChange={setShowHighScoreDialog}
                score={score}
                gameName={GAME_NAME}
                onSave={(playerName) => addHighScore({ score, playerName })}
            />

            {(gameState === 'clicked' || gameState === 'too-soon') && (
                <DifficultyAdjuster 
                    gameName="Quick Reaction"
                    playerScore={score}
                    currentDifficulty={difficulty}
                    onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                />
            )}
        </div>
    );
}
