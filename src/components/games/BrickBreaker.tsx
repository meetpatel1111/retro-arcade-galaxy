
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy, Heart, Maximize } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { cn } from '@/lib/utils';
import AiCheatCode from '../AiCheatCode';

const GAME_ID = 'brick-breaker';
const GAME_NAME = 'Brick Breaker';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;
const POWER_UP_SIZE = 15;
const POWER_UP_SPEED = 2;
const WIDE_PADDLE_DURATION = 10000; // 10 seconds

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
  beginner: { ballSpeed: 4, paddleSpeed: 7 },
  intermediate: { ballSpeed: 6, paddleSpeed: 9 },
  expert: { ballSpeed: 8, paddleSpeed: 12 },
};

type Brick = {
  x: number;
  y: number;
  status: 1 | 0;
};
type Bricks = Brick[][];

type PowerUpType = 'widePaddle' | 'extraLife';
type PowerUp = {
    x: number;
    y: number;
    type: PowerUpType;
    active: boolean;
};

const BRICK_LAYOUTS = [
    // Level 1: Standard rectangle
    () => Array.from({ length: BRICK_COLUMN_COUNT }, () => Array.from({ length: BRICK_ROW_COUNT }, () => ({ x: 0, y: 0, status: 1 }))),
    // Level 2: Pyramid
    () => {
        const bricks = Array.from({ length: BRICK_COLUMN_COUNT }, () => Array.from({ length: BRICK_ROW_COUNT }, () => ({ x: 0, y: 0, status: 0 })));
        for(let r=0; r<BRICK_ROW_COUNT; r++) {
            for(let c=r; c<BRICK_COLUMN_COUNT-r; c++) {
                if(bricks[c] && bricks[c][r]) {
                   bricks[c][r].status = 1;
                }
            }
        }
        return bricks;
    },
    // Level 3: Checkerboard
    () => {
        const bricks = createBricks();
        for(let c=0; c<BRICK_COLUMN_COUNT; c++) {
            for(let r=0; r<BRICK_ROW_COUNT; r++) {
                if((c+r) % 2 === 0) bricks[c][r].status = 0;
            }
        }
        return bricks;
    },
    // Level 4: Smile
     () => {
        const bricks = createBricks();
        for(let c=0; c<BRICK_COLUMN_COUNT; c++) {
            for(let r=0; r<BRICK_ROW_COUNT; r++) {
                bricks[c][r].status = 0;
            }
        }
        // Eyes
        bricks[2][1].status = 1;
        bricks[5][1].status = 1;
        // Smile
        bricks[1][3].status = 1;
        bricks[2][4].status = 1;
        bricks[3][4].status = 1;
        bricks[4][4].status = 1;
        bricks[5][4].status = 1;
        bricks[6][3].status = 1;
        return bricks;
    },
];

const createBricks = (): Bricks => {
    return Array.from({ length: BRICK_COLUMN_COUNT }, () => 
        Array.from({ length: BRICK_ROW_COUNT }, () => ({ x: 0, y: 0, status: 1 }))
    );
};

export default function BrickBreaker() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [gameOver, setGameOver] = useState(true);
    const [gameWon, setGameWon] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(3);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const { isHighScore, addHighScore } = useHighScores(GAME_ID);
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    
    const paddleWidthRef = useRef(100);
    const widePaddleTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    const gameState = useRef({
        ballX: CANVAS_WIDTH / 2,
        ballY: CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 5,
        ballDX: 0,
        ballDY: 0,
        paddleX: (CANVAS_WIDTH - 100) / 2,
        bricks: createBricks(),
        rightPressed: false,
        leftPressed: false,
        powerUps: [] as PowerUp[],
    });
    const difficultyRef = useRef(difficulty);
    useEffect(() => {
        difficultyRef.current = difficulty;
    }, [difficulty]);

    const resetBricksForLevel = (currentLevel: number) => {
        const layoutIndex = (currentLevel - 1) % BRICK_LAYOUTS.length;
        gameState.current.bricks = BRICK_LAYOUTS[layoutIndex]();
    }

    const resetPowerUps = () => {
      gameState.current.powerUps = [];
      if (widePaddleTimerRef.current) clearTimeout(widePaddleTimerRef.current);
      paddleWidthRef.current = 100;
    }

    const resetBallAndPaddle = useCallback((keepSpeed = false) => {
        const gs = gameState.current;
        gs.ballX = CANVAS_WIDTH / 2;
        gs.ballY = CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 5;
        if (!keepSpeed) {
            gs.ballDX = 0;
            gs.ballDY = 0;
        }
        gs.paddleX = (CANVAS_WIDTH - paddleWidthRef.current) / 2;
    }, []);

    const launchBall = useCallback(() => {
        const gs = gameState.current;
        const baseSpeed = DIFFICULTY_SETTINGS[difficultyRef.current].ballSpeed;
        const levelSpeedBonus = (level - 1) * 0.5;
        const totalSpeed = baseSpeed + levelSpeedBonus;
        
        if (gs.ballDX === 0 && gs.ballDY === 0) {
            gs.ballDX = totalSpeed * (Math.random() < 0.5 ? 1 : -1);
            gs.ballDY = -totalSpeed;
        }
    }, [level]);

    const startGame = () => {
        setScore(0);
        setLives(3);
        setLevel(1);
        setGameWon(false);
        resetBricksForLevel(1);
        resetPowerUps();
        resetBallAndPaddle();
        setGameOver(false);
        setTimeout(launchBall, 500);
    };

    const nextLevel = () => {
        const newLevel = level + 1;
        setLevel(newLevel);
        resetBricksForLevel(newLevel);
        resetPowerUps();
        resetBallAndPaddle();
        setTimeout(launchBall, 500);
    };
    
    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        
        const gs = gameState.current;
        const cardColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--card').trim()})`;
        const primaryColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()})`;
        const accentColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()})`;
        const destructiveColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--destructive').trim()})`;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = cardColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw bricks
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (gs.bricks[c][r].status === 1) {
                    const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                    const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
                    gs.bricks[c][r].x = brickX;
                    gs.bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                    ctx.fillStyle = primaryColor;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }

        // Draw power-ups
        gs.powerUps.forEach(p => {
          if(p.active) {
            ctx.font = '20px "lucide"';
            if (p.type === 'widePaddle') {
                ctx.fillStyle = accentColor;
                ctx.fillRect(p.x, p.y, POWER_UP_SIZE, POWER_UP_SIZE);
                ctx.fillStyle = 'black';
                ctx.fillText('↔', p.x, p.y + POWER_UP_SIZE);

            } else if (p.type === 'extraLife') {
                ctx.fillStyle = destructiveColor;
                ctx.fillRect(p.x, p.y, POWER_UP_SIZE, POWER_UP_SIZE);
                ctx.fillStyle = 'white';
                ctx.fillText('♥', p.x, p.y + POWER_UP_SIZE);
            }
          }
        });
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(gs.ballX, gs.ballY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.closePath();
        
        // Draw paddle
        ctx.beginPath();
        ctx.rect(gs.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, paddleWidthRef.current, PADDLE_HEIGHT);
        ctx.fillStyle = primaryColor;
        ctx.fill();
        ctx.closePath();

    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) draw();
    }, [draw, gameOver]);


    const activateWidePaddle = () => {
        paddleWidthRef.current = 150;
        if (widePaddleTimerRef.current) clearTimeout(widePaddleTimerRef.current);
        widePaddleTimerRef.current = setTimeout(() => {
            paddleWidthRef.current = 100;
        }, WIDE_PADDLE_DURATION);
    };

    useEffect(() => {
        if (gameOver) return;

        const gameLoop = () => {
            const gs = gameState.current;
            const { paddleSpeed } = DIFFICULTY_SETTINGS[difficultyRef.current];

            // Paddle movement
            if (gs.rightPressed && gs.paddleX < CANVAS_WIDTH - paddleWidthRef.current) {
                gs.paddleX += paddleSpeed;
            } else if (gs.leftPressed && gs.paddleX > 0) {
                gs.paddleX -= paddleSpeed;
            }

            // Power-up movement and collection
            gs.powerUps.forEach((p, index) => {
                if (p.active) {
                    p.y += POWER_UP_SPEED;
                    if (p.y > CANVAS_HEIGHT) {
                        p.active = false;
                    }
                    if (p.y > CANVAS_HEIGHT - PADDLE_HEIGHT &&
                        p.x > gs.paddleX &&
                        p.x < gs.paddleX + paddleWidthRef.current) {
                        p.active = false;
                        if (p.type === 'widePaddle') {
                            activateWidePaddle();
                        } else if (p.type === 'extraLife') {
                            setLives(l => l + 1);
                        }
                    }
                }
            });
            gs.powerUps = gs.powerUps.filter(p => p.active);

            // Wall collision
            if (gs.ballX + gs.ballDX > CANVAS_WIDTH - BALL_RADIUS || gs.ballX + gs.ballDX < BALL_RADIUS) {
                gs.ballDX = -gs.ballDX;
            }
            if (gs.ballY + gs.ballDY < BALL_RADIUS) {
                gs.ballDY = -gs.ballDY;
            } else if (gs.ballY + gs.ballDY > CANVAS_HEIGHT - BALL_RADIUS) {
                // Paddle collision
                if (gs.ballX > gs.paddleX && gs.ballX < gs.paddleX + paddleWidthRef.current) {
                    gs.ballDY = -gs.ballDY;
                } else {
                    setLives(l => {
                        const newLives = l - 1;
                        if (newLives <= 0) {
                            setGameOver(true);
                            if (isHighScore(score)) setShowHighScoreDialog(true);
                        } else {
                            resetBallAndPaddle();
                            setTimeout(launchBall, 500);
                        }
                        return newLives;
                    });
                }
            }
            
            // Brick collision
            let bricksLeft = 0;
            for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
                for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                    const b = gs.bricks[c][r];
                    if (b.status === 1) {
                        bricksLeft++;
                        if (
                            gs.ballX > b.x &&
                            gs.ballX < b.x + BRICK_WIDTH &&
                            gs.ballY > b.y &&
                            gs.ballY < b.y + BRICK_HEIGHT
                        ) {
                            gs.ballDY = -gs.ballDY;
                            b.status = 0;
                            setScore(s => s + 10);

                            // Chance to drop a power-up
                            if(Math.random() < 0.2) { // 20% chance
                                const type: PowerUpType = Math.random() < 0.5 ? 'widePaddle' : 'extraLife';
                                gs.powerUps.push({
                                    x: b.x + BRICK_WIDTH / 2,
                                    y: b.y,
                                    type,
                                    active: true,
                                });
                            }
                        }
                    }
                }
            }
            
            if (bricksLeft === 0) { 
                setScore(s => s + 100); // Level clear bonus
                if (level >= BRICK_LAYOUTS.length) {
                    setGameWon(true);
                    setGameOver(true);
                    if(isHighScore(score + 100)) setShowHighScoreDialog(true);
                } else {
                   nextLevel();
                }
            }

            gs.ballX += gs.ballDX;
            gs.ballY += gs.ballDY;
            
            draw();
        };
        
        const intervalId = setInterval(gameLoop, 16); // ~60 FPS
        
        return () => clearInterval(intervalId);
    }, [gameOver, draw, score, isHighScore, level, launchBall, resetBallAndPaddle]);


    useEffect(() => {
        const keyDownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = true;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = true;
        };
        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = false;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = false;
        };
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        };
    }, []);

    const getGameOutcome = () => {
        if (!gameOver) return null;
        if (gameWon) return 'win';
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
                        <p>Lives: <span className="text-accent">{lives}</span></p>
                        <p>Level: <span className="text-accent">{level}</span></p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-lg border-2 border-primary" />
                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 rounded-lg text-center">
                        <h2 className="text-5xl font-bold text-primary mb-2">
                            {gameWon ? 'You Beat All Levels!' : 'Game Over'}
                        </h2>
                        <p className="text-2xl mb-4">Final Score: {score}</p>
                        <HighScoreDialog 
                            open={showHighScoreDialog} 
                            onOpenChange={setShowHighScoreDialog}
                            score={score}
                            gameName={GAME_NAME}
                            onSave={(name, avatar) => addHighScore({ playerName: name, score, avatarDataUri: avatar })}
                        />
                         <div className="flex gap-4">
                            <Button onClick={startGame} size="lg">Start Game</Button>
                            <AiCheatCode gameName={GAME_NAME} />
                        </div>
                        <div className="flex flex-col items-center mt-4">
                            <DifficultyAdjuster 
                                gameName={GAME_NAME}
                                playerScore={score}
                                currentDifficulty={difficulty}
                                onDifficultyChange={(d) => setDifficulty(d as Difficulty)}
                            />
                            <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} score={score} />
                        </div>
                    </div>
                )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Controls: Left/Right Arrow Keys</p>
        </div>
    );
}
