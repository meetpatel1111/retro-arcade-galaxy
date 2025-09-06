
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import AiCheatCode from '../AiCheatCode';

const GAME_ID = 'space-invaders';
const GAME_NAME = 'Space Invaders';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const PLAYER_SPEED = 5;

const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 15;
const BULLET_SPEED = 7;

const ALIEN_ROWS = 5;
const ALIEN_COLS = 10;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 20;
const ALIEN_PADDING = 10;
const ALIEN_SPEED = 0.5;

type Alien = {
  x: number;
  y: number;
  alive: boolean;
};

type Bullet = {
  x: number;
  y: number;
  active: boolean;
};

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);

  const gameState = useRef({
    playerX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    bullets: [] as Bullet[],
    aliens: [] as Alien[],
    alienDirection: 1,
    leftPressed: false,
    rightPressed: false,
  });

  const createAliens = useCallback((currentLevel: number) => {
    const aliens: Alien[] = [];
    for (let r = 0; r < ALIEN_ROWS; r++) {
      for (let c = 0; c < ALIEN_COLS; c++) {
        aliens.push({
          x: c * (ALIEN_WIDTH + ALIEN_PADDING) + 30,
          y: r * (ALIEN_HEIGHT + ALIEN_PADDING) + 30,
          alive: true,
        });
      }
    }
    return aliens;
  }, []);

  const resetGame = useCallback(() => {
    setLevel(1);
    setScore(0);
    setLives(3);
    const gs = gameState.current;
    gs.playerX = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    gs.bullets = [];
    gs.aliens = createAliens(1);
    gs.alienDirection = 1;
    setGameOver(false);
  }, [createAliens]);

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

    // Draw player
    ctx.fillStyle = primaryColor;
    ctx.fillRect(gs.playerX, CANVAS_HEIGHT - PLAYER_HEIGHT - 10, PLAYER_WIDTH, PLAYER_HEIGHT);

    // Draw bullets
    ctx.fillStyle = accentColor;
    gs.bullets.forEach(bullet => {
      if (bullet.active) {
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
      }
    });

    // Draw aliens
    ctx.fillStyle = destructiveColor;
    gs.aliens.forEach(alien => {
      if (alien.alive) {
        ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT);
      }
    });
  }, []);

  useEffect(() => {
    draw();
  }, [draw, gameOver]);

  const shoot = useCallback(() => {
    const gs = gameState.current;
    if (gs.bullets.filter(b => b.active).length < 3) { // Limit active bullets
      gs.bullets.push({
        x: gs.playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
        active: true,
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameState.current.leftPressed = true;
      if (e.key === 'ArrowRight') gameState.current.rightPressed = true;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameOver) shoot();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameState.current.leftPressed = false;
      if (e.key === 'ArrowRight') gameState.current.rightPressed = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, shoot]);


  useEffect(() => {
    if (gameOver) return;

    const gameLoop = () => {
      const gs = gameState.current;

      // Player movement
      if (gs.leftPressed && gs.playerX > 0) {
        gs.playerX -= PLAYER_SPEED;
      }
      if (gs.rightPressed && gs.playerX < CANVAS_WIDTH - PLAYER_WIDTH) {
        gs.playerX += PLAYER_SPEED;
      }

      // Bullet movement
      gs.bullets.forEach(bullet => {
        if (bullet.active) {
          bullet.y -= BULLET_SPEED;
          if (bullet.y < 0) bullet.active = false;
        }
      });
      gs.bullets = gs.bullets.filter(b => b.active);

      // Alien movement
      let edgeReached = false;
      const speed = ALIEN_SPEED + (level -1) * 0.2;
      gs.aliens.forEach(alien => {
        if (alien.alive) {
          alien.x += speed * gs.alienDirection;
          if (alien.x <= 0 || alien.x + ALIEN_WIDTH >= CANVAS_WIDTH) {
            edgeReached = true;
          }
          if (alien.y + ALIEN_HEIGHT >= CANVAS_HEIGHT - PLAYER_HEIGHT - 10) {
            setGameOver(true);
            setLives(0);
          }
        }
      });

      if (edgeReached) {
        gs.alienDirection *= -1;
        gs.aliens.forEach(alien => alien.y += ALIEN_HEIGHT);
      }

      // Collision detection: bullets and aliens
      gs.bullets.forEach(bullet => {
        gs.aliens.forEach(alien => {
          if (
            bullet.active &&
            alien.alive &&
            bullet.x > alien.x &&
            bullet.x < alien.x + ALIEN_WIDTH &&
            bullet.y > alien.y &&
            bullet.y < alien.y + ALIEN_HEIGHT
          ) {
            bullet.active = false;
            alien.alive = false;
            setScore(s => s + 10);
          }
        });
      });

      // Check for level clear
      if (gs.aliens.every(a => !a.alive)) {
        setLevel(l => l + 1);
        setScore(s => s + 100 * level); // Level clear bonus
        gs.aliens = createAliens(level + 1);
        gs.bullets = [];
      }
      
      if (lives <= 0) {
         setGameOver(true);
         if (isHighScore(score)) setShowHighScoreDialog(true);
      }

      draw();
    };
    
    const interval = setInterval(gameLoop, 16);
    return () => clearInterval(interval);
  }, [gameOver, draw, level, createAliens, lives, isHighScore, score]);
  
  const getGameOutcome = () => {
    if (!gameOver || score === 0) return null;
    return lives > 0 ? 'win' : 'loss';
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

      <div className="relative">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-lg border-2 border-primary" />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 rounded-lg text-center">
            <h2 className="text-5xl font-bold text-primary mb-2">
              {score > 0 ? 'Game Over' : 'Space Invaders'}
            </h2>
            {score > 0 && <p className="text-2xl mb-4">Final Score: {score}</p>}
             <HighScoreDialog
              open={showHighScoreDialog}
              onOpenChange={setShowHighScoreDialog}
              score={score}
              gameName={GAME_NAME}
              onSave={(name, avatar) => addHighScore({ playerName: name, score, avatarDataUri: avatar })}
            />
             <div className="flex gap-4">
                <Button onClick={resetGame} size="lg">Start Game</Button>
                <AiCheatCode gameName={GAME_NAME} />
            </div>
            <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} score={score} />
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Controls: Left/Right Arrow Keys to move, Spacebar to shoot.</p>
    </div>
  );
}
