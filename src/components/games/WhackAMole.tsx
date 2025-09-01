"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { Hammer, Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';

const GAME_ID = 'whack-a-mole';
const GAME_NAME = 'Whack-a-Mole';
const GRID_SIZE = 9;
type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
    beginner: { interval: 1000, duration: 800 },
    intermediate: { interval: 700, duration: 600 },
    expert: { interval: 400, duration: 400 },
};
const GAME_DURATION_S = 30;

export default function WhackAMole() {
    const [moles, setMoles] = useState<number[]>([]); // Store active mole indices
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
    const [gameOver, setGameOver] = useState(true);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    const { isHighScore, addHighScore } = useHighScores(GAME_ID);


    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const moleIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopGame = useCallback(() => {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
        setGameOver(true);
        setMoles([]);
        if (score > 0 && isHighScore(score)) {
            setShowHighScoreDialog(true);
        }
    }, [score, isHighScore]);

    useEffect(() => {
        return () => stopGame(); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (gameOver || timeLeft <= 0) {
            if (timeLeft <= 0) stopGame();
            return;
        };

        gameTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        moleIntervalRef.current = setInterval(() => {
            setMoles(prevMoles => {
                const newMoles = [...prevMoles];
                const availableHoles = Array.from({length: GRID_SIZE}, (_, i) => i).filter(i => !newMoles.includes(i));
                if (availableHoles.length === 0) return newMoles;

                const randomIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
                newMoles.push(randomIndex);

                setTimeout(() => {
                    setMoles(currentMoles => currentMoles.filter(m => m !== randomIndex));
                }, DIFFICULTY_SETTINGS[difficulty].duration);
                
                return newMoles;
            });
        }, DIFFICULTY_SETTINGS[difficulty].interval);

        return () => {
             if (gameTimerRef.current) clearInterval(gameTimerRef.current);
             if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
        };
    }, [gameOver, difficulty, timeLeft, stopGame]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION_S);
        setGameOver(false);
        setMoles([]);
    };

    const whackMole = (index: number) => {
        if (moles.includes(index)) {
            setScore(prev => prev + 10);
            setMoles(prevMoles => prevMoles.filter(m => m !== index));
        } else {
             setScore(prev => Math.max(0, prev - 5));
        }
    };
    
    return (
        <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
                <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
                <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
                <div className='flex items-center gap-4'>
                    <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
                    <div className="text-right min-w-[100px]">
                        <p>Score: <span className="font-bold text-accent">{score}</span></p>
                        <p>Time: <span className="font-bold text-accent">{timeLeft}</span></p>
                    </div>
                </div>
            </div>
            
            {gameOver ? (
                <div className="text-center flex flex-col items-center">
                    <h2 className="text-5xl font-bold text-primary mb-4">
                        {score > 0 ? 'Game Over!' : 'Get Ready!'}
                    </h2>
                     {score > 0 && <p className="text-2xl mb-6">Final Score: {score}</p>}
                    <HighScoreDialog 
                        open={showHighScoreDialog} 
                        onOpenChange={setShowHighScoreDialog}
                        score={score}
                        gameName={GAME_NAME}
                        onSave={(playerName) => addHighScore({ score, playerName })}
                    />
                    <Button onClick={startGame} size="lg">Start Game</Button>
                    { score > 0 && 
                        <DifficultyAdjuster 
                            gameName="Whack-a-Mole"
                            playerScore={score}
                            currentDifficulty={difficulty}
                            onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                        />
                    }
                </div>
            ) : (
                 <div className="grid grid-cols-3 gap-4">
                    {Array.from({length: GRID_SIZE}).map((_, i) => (
                        <div key={i} className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center cursor-pointer border-4 border-yellow-800/50 relative overflow-hidden" onClick={() => whackMole(i)}>
                           <div className={cn("absolute bottom-0 w-full h-full bg-yellow-900/40 transition-transform duration-100", moles.includes(i) ? "translate-y-0" : "translate-y-full")}></div>
                            {moles.includes(i) && (
                                <Hammer className="w-20 h-20 text-primary transition-transform duration-300 ease-out transform animate-bounce" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
