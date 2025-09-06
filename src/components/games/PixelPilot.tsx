
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import DifficultyAdjuster from '../DifficultyAdjuster';

const GAME_ID = 'pixel-pilot';
const GAME_NAME = 'Pixel Pilot';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const SHIP_WIDTH = 40;
const SHIP_HEIGHT = 20;
const GRAVITY = 0.3;
const LIFT = -6;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_GAP = 150;
const OBSTACLE_SPEED = 3;

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
  beginner: { gap: 200, speed: 2.5 },
  intermediate: { gap: 150, speed: 3.5 },
  expert: { gap: 120, speed: 5 },
};

type Obstacle = {
  x: number;
  y: number;
  passed: boolean;
};

export default function PixelPilot() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(true);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);

  const gameState = useRef({
    shipY: CANVAS_HEIGHT / 2,
    velocityY: 0,
    obstacles: [] as Obstacle[],
    frameCount: 0,
  });
  
  const difficultyRef = useRef(difficulty);
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  const resetGame = useCallback(() => {
    const gs = gameState.current;
    gs.shipY = CANVAS_HEIGHT / 2;
    gs.velocityY = 0;
    gs.obstacles = [{ x: CANVAS_WIDTH, y: Math.random() * (CANVAS_HEIGHT - 200) + 100, passed: false }];
    gs.frameCount = 0;
    setScore(0);
    setGameOver(false);
  }, []);

  const liftShip = useCallback(() => {
    if (!gameOver) {
      gameState.current.velocityY = LIFT;
    }
  }, [gameOver]);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const gs = gameState.current;
    const cardColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--card').trim()})`;
    const primaryColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()})`;
    const accentColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()})`;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = cardColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw obstacles
    ctx.fillStyle = accentColor;
    gs.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, 0, OBSTACLE_WIDTH, obstacle.y);
      ctx.fillRect(obstacle.x, obstacle.y + DIFFICULTY_SETTINGS[difficultyRef.current].gap, OBSTACLE_WIDTH, CANVAS_HEIGHT);
    });

    // Draw ship
    ctx.fillStyle = primaryColor;
    ctx.fillRect(50, gs.shipY, SHIP_WIDTH, SHIP_HEIGHT);

  }, []);
  
  useEffect(() => {
    draw();
  }, [draw, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = () => {
      const gs = gameState.current;
      const { speed, gap } = DIFFICULTY_SETTINGS[difficultyRef.current];

      // Update ship position
      gs.velocityY += GRAVITY;
      gs.shipY += gs.velocityY;

      // Wall collision
      if (gs.shipY < 0 || gs.shipY + SHIP_HEIGHT > CANVAS_HEIGHT) {
        setGameOver(true);
        if (isHighScore(score)) setShowHighScoreDialog(true);
        return;
      }

      // Update obstacles
      gs.obstacles.forEach(obstacle => {
        obstacle.x -= speed;
        // Check collision
        if (
          50 + SHIP_WIDTH > obstacle.x && 50 < obstacle.x + OBSTACLE_WIDTH &&
          (gs.shipY < obstacle.y || gs.shipY + SHIP_HEIGHT > obstacle.y + gap)
        ) {
          setGameOver(true);
          if (isHighScore(score)) setShowHighScoreDialog(true);
        }

        // Update score
        if (obstacle.x + OBSTACLE_WIDTH < 50 && !obstacle.passed) {
          setScore(s => s + 10);
          obstacle.passed = true;
        }
      });
      
      // Remove off-screen obstacles and add new ones
      if (gs.obstacles.length > 0 && gs.obstacles[0].x < -OBSTACLE_WIDTH) {
          gs.obstacles.shift();
      }

      if (gs.frameCount % 100 === 0) {
        gs.obstacles.push({
            x: CANVAS_WIDTH,
            y: Math.random() * (CANVAS_HEIGHT - gap - 50) + 25,
            passed: false
        });
      }
      
      gs.frameCount++;
      draw();
    };

    const intervalId = setInterval(gameLoop, 16); // ~60 FPS

    return () => clearInterval(intervalId);
  }, [gameOver, score, isHighScore, draw]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if(gameOver) resetGame();
            else liftShip();
        }
    };
    const handleTouch = (e: TouchEvent) => {
        e.preventDefault();
        if(gameOver) resetGame();
        else liftShip();
    }

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouch);
    return () => {
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('touchstart', handleTouch);
    };
  }, [gameOver, liftShip, resetGame]);

  const getGameOutcome = () => {
    if (!gameOver || score === 0) return null;
    return score > 100 ? 'win' : 'loss';
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
          </div>
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-lg border-2 border-primary" />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 rounded-lg text-center">
            <h2 className="text-5xl font-bold text-primary mb-2">
              {score > 0 ? 'Game Over' : 'Pixel Pilot'}
            </h2>
            {score > 0 && <p className="text-2xl mb-4">Final Score: {score}</p>}
            <HighScoreDialog
              open={showHighScoreDialog}
              onOpenChange={setShowHighScoreDialog}
              score={score}
              gameName={GAME_NAME}
              onSave={(name) => addHighScore({ playerName: name, score })}
            />
            <Button onClick={resetGame} size="lg">Start Game</Button>
            <div className="flex flex-col items-center mt-4">
              <DifficultyAdjuster
                gameName={GAME_NAME}
                playerScore={score}
                currentDifficulty={difficulty}
                onDifficultyChange={(d) => setDifficulty(d as Difficulty)}
              />
              <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} />
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Controls: Spacebar or Touch</p>
    </div>
  );
}
