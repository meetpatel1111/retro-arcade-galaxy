
"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { cn } from '@/lib/utils';

const GAME_ID = 'simon-says';
const GAME_NAME = 'Simon Says';

type Difficulty = 'beginner' | 'intermediate' | 'expert';

const COLORS = ['green', 'red', 'yellow', 'blue'];
const COLOR_CLASSES = {
    green: 'bg-green-500 hover:bg-green-600',
    red: 'bg-red-500 hover:bg-red-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    active: 'brightness-150 scale-105'
};


export default function SimonSays() {
    const [sequence, setSequence] = useState<string[]>([]);
    const [playerSequence, setPlayerSequence] = useState<string[]>([]);
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const [isPlayersTurn, setIsPlayersTurn] = useState(false);
    const [isDisplaying, setIsDisplaying] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(true);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const { isHighScore, addHighScore } = useHighScores(GAME_ID);
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    
    const getDisplaySpeed = () => {
        const baseSpeed = { beginner: 800, intermediate: 600, expert: 400 }[difficulty];
        return Math.max(150, baseSpeed - (level * 20));
    };

    const addToSequence = () => {
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setSequence(prev => [...prev, randomColor]);
    };

    const startGame = useCallback(() => {
        setGameOver(false);
        setScore(0);
        setLevel(1);
        setSequence([]);
        setPlayerSequence([]);
        setIsPlayersTurn(false);
        setTimeout(() => {
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            setSequence([randomColor]);
        }, 1000);
    }, []);

    const displaySequence = useCallback(async () => {
        setIsDisplaying(true);
        setIsPlayersTurn(false);
        await new Promise(r => setTimeout(r, 500));
        for (const color of sequence) {
            setActiveColor(color);
            await new Promise(r => setTimeout(r, getDisplaySpeed()));
            setActiveColor(null);
            await new Promise(r => setTimeout(r, 100));
        }
        setIsPlayersTurn(true);
        setPlayerSequence([]);
        setIsDisplaying(false);
    }, [sequence, getDisplaySpeed]);

    useEffect(() => {
        if (!gameOver && sequence.length > 0) {
            displaySequence();
        }
    }, [sequence, gameOver, displaySequence]);
    
    const handlePlayerClick = (color: string) => {
        if (!isPlayersTurn || isDisplaying || gameOver) return;

        const newPlayerSequence = [...playerSequence, color];
        setPlayerSequence(newPlayerSequence);
        
        // Check if correct
        if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
            setGameOver(true);
            if (isHighScore(score)) {
                setShowHighScoreDialog(true);
            }
            return;
        }

        // Check if sequence is complete
        if (newPlayerSequence.length === sequence.length) {
            setScore(s => s + 10 * level);
            setLevel(l => l + 1);
            setIsPlayersTurn(false);
            setTimeout(() => {
                addToSequence();
            }, 1000);
        }
    };
    
    const getGameOutcome = () => {
        if (!gameOver) return null;
        if (level > 5) return 'win'; 
        return 'loss';
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
                <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
                <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
                     <div className="text-right min-w-[100px] text-lg font-bold">
                        <p>Score: <span className="text-accent">{score}</span></p>
                        <p>Level: <span className="text-accent">{level}</span></p>
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
                        onSave={(name) => addHighScore({ score, playerName: name })}
                    />
                    <Button onClick={startGame} size="lg">Start Game</Button>
                    {score > 0 &&
                        <div className="text-center flex flex-col items-center mt-4">
                            <DifficultyAdjuster
                                gameName={GAME_NAME}
                                playerScore={score}
                                currentDifficulty={difficulty}
                                onDifficultyChange={(d) => setDifficulty(d as Difficulty)}
                            />
                            <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} score={score} />
                        </div>
                    }
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="text-2xl font-bold text-accent">
                        {isPlayersTurn ? "Your Turn" : isDisplaying ? "Watch" : "Get Ready"}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {COLORS.map((color, index) => (
                             <button
                                key={color}
                                onClick={() => handlePlayerClick(color)}
                                className={cn(
                                    "w-48 h-48 rounded-lg transition-all duration-200",
                                    COLOR_CLASSES[color as keyof typeof COLOR_CLASSES],
                                    activeColor === color && COLOR_CLASSES.active,
                                    index === 0 && 'rounded-tl-full',
                                    index === 1 && 'rounded-tr-full',
                                    index === 2 && 'rounded-bl-full',
                                    index === 3 && 'rounded-br-full'
                                )}
                                disabled={!isPlayersTurn || isDisplaying}
                             />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
