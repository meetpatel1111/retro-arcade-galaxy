
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { ArrowUp, ArrowDown, Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';

const GAME_ID = 'pong';
const GAME_NAME = 'Pong';
const WINNING_SCORE = 5;

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 6;

type GameState = {
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
  paddle1Velocity: number;
  paddle2Velocity: number;
};

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
  beginner: { ballSpeed: 4, aiSpeed: 2 },
  intermediate: { ballSpeed: 6, aiSpeed: 3.5 },
  expert: { ballSpeed: 8, aiSpeed: 6 },
};

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameStateRef = useRef<GameState>({
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballSpeedX: 0,
    ballSpeedY: 0,
    paddle1Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score1: 0,
    score2: 0,
    paddle1Velocity: 0,
    paddle2Velocity: 0,
  });
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [gameMode, setGameMode] = useState<'player' | 'ai'>('ai');
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);
  
  const difficultyRef = useRef(difficulty);
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);
  
  const levelRef = useRef(level);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const resetBall = useCallback((direction: 'left' | 'right') => {
    const gs = gameStateRef.current;
    gs.ballX = CANVAS_WIDTH / 2;
    gs.ballY = CANVAS_HEIGHT / 2;
    const { ballSpeed } = DIFFICULTY_SETTINGS[difficultyRef.current];
    const levelBonus = (levelRef.current - 1) * 0.5;
    gs.ballSpeedX = (direction === 'left' ? -1 : 1) * (ballSpeed + levelBonus);
    gs.ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * ((ballSpeed + levelBonus) / 2);
  }, []);

  const startGame = useCallback(() => {
    const gs = gameStateRef.current;
    gs.score1 = 0;
    gs.score2 = 0;
    setScores({ player1: 0, player2: 0 });
    setLevel(1);
    setGameOver(false);
    setWinner(null);
    gs.paddle1Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gs.paddle2Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gs.ballSpeedX = 0;
    gs.ballSpeedY = 0;
    setTimeout(() => {
        resetBall(Math.random() > 0.5 ? 'left' : 'right');
    }, 500);
  }, [resetBall]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const gs = gameStateRef.current;
    
    const cardColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--card').trim()})`;
    const primaryColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()})`;
    const accentColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()})`;

    ctx.fillStyle = cardColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.strokeStyle = primaryColor;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, gs.paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    ctx.fillStyle = accentColor;
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gs.paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    ctx.beginPath();
    ctx.arc(gs.ballX, gs.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }, [])

  useEffect(() => {
    draw();
  }, [draw, gameOver])
  
  useEffect(() => {
    if (gameOver) return;
    
    const gameLoop = () => {
        const gs = gameStateRef.current;
        const { aiSpeed } = DIFFICULTY_SETTINGS[difficultyRef.current];
        
        // Move ball
        gs.ballX += gs.ballSpeedX;
        gs.ballY += gs.ballSpeedY;

        // Move paddles
        gs.paddle1Y += gs.paddle1Velocity;
        if (gs.paddle1Y < 0) gs.paddle1Y = 0;
        if (gs.paddle1Y > CANVAS_HEIGHT - PADDLE_HEIGHT) gs.paddle1Y = CANVAS_HEIGHT - PADDLE_HEIGHT;

        gs.paddle2Y += gs.paddle2Velocity;
        if (gs.paddle2Y < 0) gs.paddle2Y = 0;
        if (gs.paddle2Y > CANVAS_HEIGHT - PADDLE_HEIGHT) gs.paddle2Y = CANVAS_HEIGHT - PADDLE_HEIGHT;

        // AI movement
        if (gameMode === 'ai') {
          const aiLevelSpeed = aiSpeed + (levelRef.current - 1) * 0.5; // AI gets faster as player scores
          const paddleCenter = gs.paddle2Y + PADDLE_HEIGHT / 2;
          if (paddleCenter < gs.ballY - 20) {
            gs.paddle2Y += aiLevelSpeed;
          } else if (paddleCenter > gs.ballY + 20) {
            gs.paddle2Y -= aiLevelSpeed;
          }
        }
        
        // Ball collision with top/bottom walls
        if (gs.ballY < BALL_RADIUS || gs.ballY > CANVAS_HEIGHT - BALL_RADIUS) {
          gs.ballSpeedY = -gs.ballSpeedY;
        }

        // Ball collision with paddles
        if (
          gs.ballX - BALL_RADIUS < PADDLE_WIDTH + 5 && gs.ballX - BALL_RADIUS > 0 &&
          gs.ballY > gs.paddle1Y &&
          gs.ballY < gs.paddle1Y + PADDLE_HEIGHT
        ) {
          gs.ballSpeedX = -gs.ballSpeedX;
          let deltaY = gs.ballY - (gs.paddle1Y + PADDLE_HEIGHT/2);
          gs.ballSpeedY = deltaY * 0.35;
        }
        
        if (
            gs.ballX + BALL_RADIUS > CANVAS_WIDTH - PADDLE_WIDTH - 5 && gs.ballX + BALL_RADIUS < CANVAS_WIDTH &&
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
          resetBall('left');
        } else if (gs.ballX > CANVAS_WIDTH) {
          gs.score1++;
          setLevel(l => l + 1);
          setScores({ player1: gs.score1, player2: gs.score2 });
          resetBall('right');
        }
        
        // Check for winner
        if (gs.score1 >= WINNING_SCORE) {
          setWinner('Player 1');
          setGameOver(true);
          const score = gs.score1 * 10 - gs.score2 * 5 + levelRef.current * 20;
          if (isHighScore(score)) {
              setShowHighScoreDialog(true);
          }
        } else if (gs.score2 >= WINNING_SCORE) {
          setWinner(gameMode === 'ai' ? 'AI' : 'Player 2');
          setGameOver(true);
        }

        draw();
    };

    const intervalId = setInterval(gameLoop, 16); // ~60 FPS
    
    return () => clearInterval(intervalId);
  }, [gameOver, gameMode, isHighScore, draw, resetBall]);

   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(gameOver) return;
      // Player 1 controls
      if (e.key === 'ArrowUp') {
        gameStateRef.current.paddle1Velocity = -PADDLE_SPEED;
      } else if (e.key === 'ArrowDown') {
        gameStateRef.current.paddle1Velocity = PADDLE_SPEED;
      }
      // Player 2 controls
      if (gameMode === 'player') {
         if (e.key === 'w') {
            gameStateRef.current.paddle2Velocity = -PADDLE_SPEED;
        } else if (e.key === 's') {
            gameStateRef.current.paddle2Velocity = PADDLE_SPEED;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
       if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        gameStateRef.current.paddle1Velocity = 0;
      }
      if (gameMode === 'player') {
        if (e.key === 'w' || e.key === 's') {
            gameStateRef.current.paddle2Velocity = 0;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, gameMode]);


  const handlePlayer1Move = (direction: 'up' | 'down' | 'stop') => {
    if (direction === 'up') {
      gameStateRef.current.paddle1Velocity = -PADDLE_SPEED;
    } else if (direction === 'down') {
      gameStateRef.current.paddle1Velocity = PADDLE_SPEED;
    } else {
      gameStateRef.current.paddle1Velocity = 0;
    }
  };

  const playerScore = scores.player1 * 10 - scores.player2 * 5 + level * 20;
  
  const getGameOutcome = () => {
    if (gameMode !== 'ai' || !winner) return null;
    if (winner === 'Player 1') return 'win';
    if (winner === 'AI') return 'loss';
    return null; // Should not happen
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
        <div className="flex items-center gap-4">
             <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
            <div className="text-right min-w-[100px] text-lg font-bold">
                <p>Score: <span className="text-primary">{scores.player1}</span> : <span className="text-accent">{scores.player2}</span></p>
                {gameMode === 'ai' && <p>Level: <span className="text-accent">{level}</span></p>}
            </div>
        </div>
      </div>
      
      <div className="relative w-full max-w-[600px] aspect-[3/2]">
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
                            onSave={(playerName, avatar) => addHighScore({ score: playerScore, playerName, avatarDataUri: avatar })}
                        />
                        <Button onClick={startGame} size="lg">Play Again</Button>
                        {gameMode === 'ai' && (
                             <>
                                <DifficultyAdjuster 
                                    gameName="Pong AI"
                                    playerScore={playerScore}
                                    currentDifficulty={difficulty}
                                    onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                                />
                                <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} score={playerScore} />
                             </>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="text-5xl font-bold text-primary mb-4">Pong</h2>
                         <div className="mb-4">
                            <RadioGroup value={gameMode} onValueChange={(value) => { setGameMode(value as 'player' | 'ai') }} className="flex gap-4">
                                 <div className="flex items-center space-x-2">
                                <RadioGroupItem value="player" id="player" />
                                <Label htmlFor="player">2 Players</Label>
                                </div>
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
          <p className="text-sm text-muted-foreground">Controls: Arrow Keys or Buttons</p>
           {gameMode === 'player' && <p className="text-sm text-muted-foreground">Player 2: W & S Keys</p>}
          <div className="flex gap-4">
             <Button
                size="lg"
                onMouseDown={() => handlePlayer1Move('up')}
                onMouseUp={() => handlePlayer1Move('stop')}
                onTouchStart={(e) => { e.preventDefault(); handlePlayer1Move('up'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePlayer1Move('stop'); }}
            >
                <ArrowUp /> Up
            </Button>
            <Button
                size="lg"
                onMouseDown={() => handlePlayer1Move('down')}
                onMouseUp={() => handlePlayer1Move('stop')}
                onTouchStart={(e) => { e.preventDefault(); handlePlayer1Move('down'); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePlayer1Move('stop'); }}
            >
                <ArrowDown /> Down
            </Button>
          </div>
      </div>
    </div>
  );
}
