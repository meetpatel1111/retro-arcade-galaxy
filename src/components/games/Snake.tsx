"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import HighScoreDialog from '../HighScoreDialog';
import { useHighScores } from '@/hooks/useHighScores';

const GAME_ID = 'snake';
const GAME_NAME = 'Snake';
const GRID_SIZE = 20;
const TILE_SIZE = 20;

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
    beginner: 150,
    intermediate: 100,
    expert: 50,
};

type Vector = { x: number; y: number };

const getRandomCoord = (snake: Vector[] = []): Vector => {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    return newFoodPosition;
};

export default function Snake() {
    const [snake, setSnake] = useState<Vector[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Vector>(getRandomCoord(snake));
    const [direction, setDirection] = useState<Vector>({ x: 0, y: -1 }); // up
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [isStarted, setIsStarted] = useState(false);
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    const { isHighScore, addHighScore } = useHighScores(GAME_ID);
    const directionRef = useRef(direction);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleSetDirection = useCallback((newDirection: Vector) => {
        const currentDirection = directionRef.current;
        if (currentDirection.x === -newDirection.x && currentDirection.y === -newDirection.y) {
            return;
        }
        directionRef.current = newDirection;
    }, []);
    
    const handleGameOver = useCallback(() => {
        setGameOver(true);
        setIsStarted(false);
        if (isHighScore(score)) {
            setShowHighScoreDialog(true);
        }
    }, [score, isHighScore]);

    const startGame = useCallback(() => {
        const startSnake = [{ x: 10, y: 10 }];
        setSnake(startSnake);
        setFood(getRandomCoord(startSnake));
        directionRef.current = { x: 0, y: -1 };
        setDirection({ x: 0, y: -1 });
        setScore(0);
        setGameOver(false);
        setIsStarted(true);
    }, []);
    
    const runGame = useCallback(() => {
        setDirection(directionRef.current);
        setSnake(prevSnake => {
            if (prevSnake.length === 0) return [];
            const newSnake = [...prevSnake];
            const head = { 
                x: (newSnake[0].x + directionRef.current.x + GRID_SIZE) % GRID_SIZE, 
                y: (newSnake[0].y + directionRef.current.y + GRID_SIZE) % GRID_SIZE 
            };

            for (let i = 0; i < newSnake.length; i++) {
                if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
                    handleGameOver();
                    return prevSnake;
                }
            }

            newSnake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                setFood(getRandomCoord(newSnake));
            } else {
                newSnake.pop();
            }
            
            return newSnake;
        });
    }, [food, handleGameOver]);
    
    useEffect(() => {
        if (isStarted && !gameOver) {
            const gameLoop = setInterval(runGame, DIFFICULTY_SETTINGS[difficulty]);
            return () => clearInterval(gameLoop);
        }
    }, [isStarted, gameOver, runGame, difficulty]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isStarted) return;
            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp': handleSetDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': handleSetDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': handleSetDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': handleSetDirection({ x: 1, y: 0 }); break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isStarted, handleSetDirection]);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        
        const cardColor = getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

        ctx.fillStyle = `hsl(${cardColor})`;
        ctx.fillRect(0, 0, GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE);

        if (!isStarted && !gameOver) return;

        ctx.fillStyle = `hsl(${primaryColor})`;
        snake.forEach(segment => {
            ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE -1 , TILE_SIZE -1);
        });

        ctx.fillStyle = `hsl(${accentColor})`;
        ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }, [snake, food, isStarted, gameOver]);

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

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * TILE_SIZE}
                    height={GRID_SIZE * TILE_SIZE}
                    className="rounded-lg border-2 border-primary"
                />
                {!isStarted && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                         <Button onClick={startGame} size="lg">Start Game</Button>
                    </div>
                )}
                 {gameOver && (
                    <div className="absolute inset-0 text-center flex flex-col items-center justify-center bg-background/80 p-8 rounded-lg">
                        <h2 className="text-5xl font-bold text-destructive mb-4">Game Over</h2>
                        <p className="text-2xl mb-6">Final Score: {score}</p>
                        <HighScoreDialog
                            open={showHighScoreDialog}
                            onOpenChange={setShowHighScoreDialog}
                            score={score}
                            gameName={GAME_NAME}
                            onSave={(playerName) => addHighScore({ score, playerName })}
                        />
                        <Button onClick={startGame} size="lg">Play Again</Button>
                         <DifficultyAdjuster 
                            gameName="Snake"
                            playerScore={score}
                            currentDifficulty={difficulty}
                            onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                        />
                    </div>
                )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 w-48">
                <div></div>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: 0, y: -1 })}><ArrowUp /></Button>
                <div></div>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: -1, y: 0 })}><ArrowLeft /></Button>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: 0, y: 1 })}><ArrowDown /></Button>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: 1, y: 0 })}><ArrowRight /></Button>
            </div>
             <p className="text-sm text-muted-foreground mt-2">Controls: Arrow Keys or Buttons</p>
        </div>
    );
}
