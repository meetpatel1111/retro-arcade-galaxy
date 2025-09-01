"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const GRID_SIZE = 20;
const TILE_SIZE = 20;

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
    beginner: 150,
    intermediate: 100,
    expert: 50,
};

type Vector = { x: number; y: number };

const getRandomCoord = (): Vector => ({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
});

export default function Snake() {
    const [snake, setSnake] = useState<Vector[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Vector>(getRandomCoord());
    const [direction, setDirection] = useState<Vector>({ x: 0, y: -1 }); // up
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleSetDirection = (newDirection: Vector) => {
        // Prevent snake from reversing on itself
        if (direction.x === -newDirection.x && direction.y === -newDirection.y) {
            return;
        }
        setDirection(newDirection);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': if (direction.y === 0) handleSetDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (direction.y === 0) handleSetDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (direction.x === 0) handleSetDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (direction.x === 0) handleSetDirection({ x: 1, y: 0 }); break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [direction]);

    const startGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(getRandomCoord());
        setDirection({ x: 0, y: -1 });
        setScore(0);
        setGameOver(false);
    };

    const runGame = useCallback(() => {
        if (gameOver) return;
        setSnake(prevSnake => {
            const newSnake = [...prevSnake];
            const head = { 
                x: (newSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE, 
                y: (newSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE 
            };

            if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setGameOver(true);
                return prevSnake;
            }

            newSnake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                let newFoodPosition;
                do {
                    newFoodPosition = getRandomCoord();
                } while (newSnake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
                setFood(newFoodPosition);
            } else {
                newSnake.pop();
            }
            
            return newSnake;
        });
    }, [direction, food, gameOver]);


    useEffect(() => {
        startGame();
    }, [difficulty]);
    
    useEffect(() => {
        if (gameOver) {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }
        
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(runGame, DIFFICULTY_SETTINGS[difficulty]);
        
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [runGame, gameOver, difficulty]);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = 'hsl(var(--card))';
        ctx.fillRect(0, 0, GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE);

        ctx.fillStyle = 'hsl(var(--primary))';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE -1 , TILE_SIZE -1);
        });

        ctx.fillStyle = 'hsl(var(--accent))';
        ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }, [snake, food]);

    return (
        <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
                <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
                <h1 className="text-4xl font-bold text-primary">Snake</h1>
                <div className="text-right min-w-[100px]">
                    <p>Score: <span className="font-bold text-accent">{score}</span></p>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={GRID_SIZE * TILE_SIZE}
                height={GRID_SIZE * TILE_SIZE}
                className="rounded-lg border-2 border-primary"
            />
             {gameOver && (
                <div className="text-center flex flex-col items-center mt-4">
                    <h2 className="text-5xl font-bold text-destructive mb-4">Game Over</h2>
                    <p className="text-2xl mb-6">Final Score: {score}</p>
                    <Button onClick={startGame} size="lg">Play Again</Button>
                     <DifficultyAdjuster 
                        gameName="Snake"
                        playerScore={score}
                        currentDifficulty={difficulty}
                        onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                    />
                </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 w-48 md:hidden">
                <div></div>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: 0, y: -1 })}><ArrowUp /></Button>
                <div></div>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: -1, y: 0 })}><ArrowLeft /></Button>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: 0, y: 1 })}><ArrowDown /></Button>
                <Button size="icon" className="h-16 w-16" onClick={() => handleSetDirection({ x: 1, y: 0 })}><ArrowRight /></Button>
            </div>
        </div>
    );
}
