"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { Hammer } from 'lucide-react';

const GRID_SIZE = 9;
type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
    beginner: { interval: 1000, duration: 1500 },
    intermediate: { interval: 700, duration: 1000 },
    expert: { interval: 400, duration: 600 },
};
const GAME_DURATION_MS = 30000;

export default function WhackAMole() {
    const [moles, setMoles] = useState<boolean[]>(new Array(GRID_SIZE).fill(false));
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS / 1000);
    const [gameOver, setGameOver] = useState(true);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');

    useEffect(() => {
        if (gameOver) return;

        const gameTimer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        const moleInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * GRID_SIZE);
            setMoles(prevMoles => {
                const newMoles = [...prevMoles];
                newMoles[randomIndex] = true;
                return newMoles;
            });

            setTimeout(() => {
                 setMoles(prevMoles => {
                    const newMoles = [...prevMoles];
                    newMoles[randomIndex] = false;
                    return newMoles;
                });
            }, DIFFICULTY_SETTINGS[difficulty].duration);

        }, DIFFICULTY_SETTINGS[difficulty].interval);

        return () => {
            clearInterval(gameTimer);
            clearInterval(moleInterval);
        };
    }, [gameOver, difficulty]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION_MS / 1000);
        setGameOver(false);
        setMoles(new Array(GRID_SIZE).fill(false));
    };

    const whackMole = (index: number) => {
        if (moles[index]) {
            setScore(prev => prev + 10);
            setMoles(prevMoles => {
                const newMoles = [...prevMoles];
                newMoles[index] = false;
                return newMoles;
            });
        }
    };
    
    return (
        <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
                <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
                <h1 className="text-4xl font-bold text-primary">Whack-a-Mole</h1>
                <div className="text-right min-w-[100px]">
                    <p>Score: <span className="font-bold text-accent">{score}</span></p>
                    <p>Time: <span className="font-bold text-accent">{timeLeft}</span></p>
                </div>
            </div>
            
            {gameOver ? (
                <div className="text-center flex flex-col items-center">
                    <h2 className="text-5xl font-bold text-primary mb-4">
                        {score > 0 ? 'Game Over!' : 'Get Ready!'}
                    </h2>
                     {score > 0 && <p className="text-2xl mb-6">Final Score: {score}</p>}
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
                    {moles.map((isMole, i) => (
                        <div key={i} className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center cursor-pointer border-4 border-yellow-800/50" onClick={() => whackMole(i)}>
                            {isMole && (
                                <Hammer className="w-20 h-20 text-primary animate-bounce" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
