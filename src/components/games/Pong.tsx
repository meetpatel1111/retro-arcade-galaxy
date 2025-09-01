"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';

const GAME_ID = 'pong';
const GAME_NAME = 'Pong';
const WINNING_SCORE = 5;

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_PADDLE_SPEED = 10;

type GameState = {
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
  player1Velocity: number;
};

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
  beginner: { ballSpeed: 4, aiSpeed: 3 },
  intermediate: { ballSpeed: 6, aiSpeed: 5 },
  expert: { ballSpeed: 8, aiSpeed: 7 },
};

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameStateRef = useRef<GameState>({
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballSpeedX: 5,
    ballSpeedY: 5,
    paddle1Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score1: 0,
    score2: 0,
    player1Velocity: 0,
  });
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [gameOver, setGameOver] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [gameMode, setGameMode] = useState<'player' | 'ai'>('ai');
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);

  const resetBall = useCallback(() => {
    const gs = gameStateRef.current;
    gs.ballX = CANVAS_WIDTH / 2;
    gs.ballY = CANVAS_HEIGHT / 2;
    // Serve to the player who just scored
    gs.ballSpeedX = (gs.ballSpeedX > 0 ? -1 : 1) * DIFFICULTY_SETTINGS[difficulty].ballSpeed;
    gs.ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (DIFFICULTY_SETTINGS[difficulty].ballSpeed / 2);
  }, [difficulty]);

  const startGame = useCallback(() => {
    const gs = gameStateRef.current;
    gs.score1 = 0;
    gs.score2 = 0;
    setScores({ player1: 0, player2: 0 });
    setGameOver(false);
    setWinner(null);
    gs.paddle1Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gs.paddle2Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    resetBall();
  }, [resetBall]);
  
  const gameLoop = useCallback(() => {
    if (gameOver) return;

    const gs = gameStateRef.current;
    const { aiSpeed } = DIFFICULTY_SETTINGS[difficulty];
    
    // Move ball
    gs.ballX += gs.ballSpeedX;
    gs.ballY += gs.ballSpeedY;

    // Move player paddle
    gs.paddle1Y += gs.player1Velocity;
    if (gs.paddle1Y < 0) gs.paddle1Y = 0;
    if (gs.paddle1Y > CANVAS_HEIGHT - PADDLE_HEIGHT) gs.paddle1Y = CANVAS_HEIGHT - PADDLE_HEIGHT;


    // AI movement
    if (gameMode === 'ai') {
      const paddleCenter = gs.paddle2Y + PADDLE_HEIGHT / 2;
      if (paddleCenter < gs.ballY - 35) {
        gs.paddle2Y += aiSpeed;
      } else if (paddleCenter > gs.ballY + 35) {
        gs.paddle2Y -= aiSpeed;
      }
       if (gs.paddle2Y < 0) gs.paddle2Y = 0;
       if (gs.paddle2Y > CANVAS_HEIGHT - PADDLE_HEIGHT) gs.paddle2Y = CANVAS_HEIGHT - PADDLE_HEIGHT;
    }
    
    // Ball collision with top/bottom walls
    if (gs.ballY < BALL_RADIUS || gs.ballY > CANVAS_HEIGHT - BALL_RADIUS) {
      gs.ballSpeedY = -gs.ballSpeedY;
    }

    // Ball collision with paddles
    // Player 1 paddle
    if (
      gs.ballX - BALL_RADIUS < PADDLE_WIDTH &&
      gs.ballY > gs.paddle1Y &&
      gs.ballY < gs.paddle1Y + PADDLE_HEIGHT
    ) {
      gs.ballSpeedX = -gs.ballSpeedX;
      let deltaY = gs.ballY - (gs.paddle1Y + PADDLE_HEIGHT/2);
      gs.ballSpeedY = deltaY * 0.35;
    }
    
    // Player 2 / AI paddle
    if (
        gs.ballX + BALL_RADIUS > CANVAS_WIDTH - PADDLE_WIDTH &&
        gs.ballY > gs.paddle2Y &&
        gs.ballY < gs.paddle2Y + PADDLE_HEIGHT
    ) {
        gs.ballSpeedX = -gs.ballSpeedX;
        let deltaY = gs.ballY - (gs.paddle2Y + PADDLE_HEIGHT/2);
        gs.ballSpeedY = deltaY * 0.35;
    }

    // Scoring
    if (gs.ballX < 0) {
      gs.score2++;
      setScores({ player1: gs.score1, player2: gs.score2 });
      resetBall();
    } else if (gs.ballX > CANVAS_WIDTH) {
      gs.score1++;
      setScores({ player1: gs.score1, player2: gs.score2 });
      resetBall();
    }
    
    // Check for winner
    if (gs.score1 >= WINNING_SCORE) {
      setWinner('Player 1');
      setGameOver(true);
      const score = gameMode === 'ai' ? gs.score1 * 10 - gs.score2 * 5 : 0;
      if (gameMode === 'ai' && isHighScore(score)) {
          setShowHighScoreDialog(true);
      }
    } else if (gs.score2 >= WINNING_SCORE) {
      setWinner(gameMode === 'ai' ? 'AI' : 'Player 2');
      setGameOver(true);
    }

    // Draw everything
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const cardColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--card').trim()})`;
    const primaryColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()})`;
    const accentColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()})`;

    ctx.fillStyle = cardColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Dashed line
    ctx.strokeStyle = primaryColor;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Paddles
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, gs.paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gs.paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Ball
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(gs.ballX, gs.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
  }, [gameOver, difficulty, resetBall, gameMode, isHighScore]);

  useEffect(() => {
    if (!gameOver) {
      const animationFrameId = requestAnimationFrame(gameLoop);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [gameOver, gameLoop]);


  const handlePlayerMove = (direction: 'up' | 'down' | 'stop') => {
    if (direction === 'up') {
      gameStateRef.current.player1Velocity = -PLAYER_PADDLE_SPEED;
    } else if (direction === 'down') {
      gameStateRef.current.player1Velocity = PLAYER_PADDLE_SPEED;
    } else {
      gameStateRef.current.player1Velocity = 0;
    }
  };

  const playerScore = gameMode === 'ai' ? scores.player1 * 10 - scores.player2 * 5 : 0;
  
  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
        <div className="flex items-center gap-4">
             <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
            <div className="text-right min-w-[100px] text-2xl font-bold">
                <span className="text-primary">{scores.player1}</span> : <span className="text-accent">{scores.player2}</span>
            </div>
        </div>
      </div>
      
      <div className="relative w-full aspect-[3/2] max-w-[600px]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg border-2 border-primary w-full h-full"
        />
         {(gameOver) && (
            <div className="absolute inset-0 text-center flex flex-col items-center justify-center bg-background/80 p-8 rounded-lg">
                {winner ? (
                     <>
                        <h2 className="text-5xl font-bold text-primary mb-4">{winner} Wins!</h2>
                         <HighScoreDialog 
                            open={showHighScoreDialog} 
                            onOpenChange={setShowHighScoreDialog}
                            score={playerScore}
                            gameName={GAME_NAME}
                            onSave={(playerName) => addHighScore({ score: playerScore, playerName })}
                        />
                        <Button onClick={startGame} size="lg">Play Again</Button>
                        {gameMode === 'ai' && (
                             <DifficultyAdjuster 
                                gameName="Pong AI"
                                playerScore={playerScore}
                                currentDifficulty={difficulty}
                                onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="text-5xl font-bold text-primary mb-4">Pong</h2>
                         <div className="mb-4">
                            <RadioGroup value={gameMode} onValueChange={(value) => { setGameMode(value as 'player' | 'ai') }} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ai" id="ai" />
                                <Label htmlFor="ai">vs AI</Label>
                                </div>
                            </RadioGroup>
                         </div>
                        <Button onClick={startGame} size="lg">Start Game</Button>
                    </>
                )}
            </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Controls</p>
          <div className="flex gap-4">
             <Button
                size="lg"
                onMouseDown={() => handlePlayerMove('up')}
                onMouseUp={() => handlePlayerMove('stop')}
                onTouchStart={(e) => { e.preventDefault(); handlePlayerMove('up'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePlayerMove('stop'); }}
            >
                <ArrowUp /> Up
            </Button>
            <Button
                size="lg"
                onMouseDown={() => handlePlayerMove('down')}
                onMouseUp={() => handlePlayerMove('stop')}
                onTouchStart={(e) => { e.preventDefault(); handlePlayerMove('down'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePlayerMove('stop'); }}
            >
                <ArrowDown /> Down
            </Button>
          </div>
      </div>
    </div>
  );
}
