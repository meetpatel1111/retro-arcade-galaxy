
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';

const GAME_ID = 'tic-tac-toe';
const GAME_NAME = 'Tic-Tac-Toe';

type Player = 'X' | 'O';
type Squares = (Player | null)[];
type GameMode = 'player' | 'ai';
type Difficulty = 'beginner' | 'intermediate' | 'expert';


function calculateWinner(squares: Squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(squares: Squares) {
  return squares.every(square => square !== null);
}

// Minimax algorithm for AI
function minimax(squares: Squares, isMaximizing: boolean): { score: number; index?: number } {
  const winner = calculateWinner(squares);
  if (winner === 'O') return { score: 10 };
  if (winner === 'X') return { score: -10 };
  if (isBoardFull(squares)) return { score: 0 };

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMoveIndex: number | undefined = undefined;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        const newSquares = [...squares];
        newSquares[i] = 'O';
        const { score } = minimax(newSquares, false);
        if (score > bestScore) {
          bestScore = score;
          bestMoveIndex = i;
        }
      }
    }
    return { score: bestScore, index: bestMoveIndex };
  } else {
    let bestScore = Infinity;
    let bestMoveIndex: number | undefined = undefined;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
            const newSquares = [...squares];
            newSquares[i] = 'X';
            const { score } = minimax(newSquares, true);
            if (score < bestScore) {
                bestScore = score;
                bestMoveIndex = i;
            }
        }
    }
    return { score: bestScore, index: bestMoveIndex };
  }
}


export default function TicTacToe() {
  const [squares, setSquares] = useState<Squares>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const winner = calculateWinner(squares);
  const isDraw = !winner && isBoardFull(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "It's a Draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }
  
  useEffect(() => {
    if(startTime === null && gameMode === 'ai' && !winner && !isDraw) {
        setStartTime(Date.now());
    }
    
    if ((winner || isDraw) && gameMode === 'ai' && startTime !== null) {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000; // in seconds
        let finalScore = 0;
        if (winner === 'X') {
            finalScore = Math.max(0, 1000 - Math.floor(timeTaken * 10));
        } else if (isDraw) {
            finalScore = 50;
        }
        setScore(finalScore);
        
        if (winner === 'X' && isHighScore(finalScore)) {
          setShowHighScoreDialog(true);
        }
        setStartTime(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, isDraw, gameMode, startTime]);

  function handleClick(i: number) {
    if (squares[i] || winner || (gameMode === 'ai' && !xIsNext)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }
  
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setScore(0);
    setStartTime(null);
  }

  const aiMove = () => {
    // Beginner: random move
    if (difficulty === 'beginner') {
      const emptySquares = squares.map((s, i) => s === null ? i : null).filter(i => i !== null);
      if (emptySquares.length > 0) {
        const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)]!;
        setTimeout(() => {
            const currentSquares = squares;
            if (calculateWinner(currentSquares) || isBoardFull(currentSquares)) return;
            const nextSquares = currentSquares.slice();
            nextSquares[randomIndex] = 'O';
            setSquares(nextSquares);
            setXIsNext(true);
        }, 500);
      }
    } else { // Intermediate & Expert: use minimax
        // Expert AI is unbeatable, Intermediate has a chance to make a mistake
        if (difficulty === 'intermediate' && Math.random() < 0.3) {
             const emptySquares = squares.map((s, i) => s === null ? i : null).filter(i => i !== null);
             if (emptySquares.length > 0) {
                const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)]!;
                setTimeout(() => {
                    const currentSquares = squares;
                    if (calculateWinner(currentSquares) || isBoardFull(currentSquares)) return;
                    const nextSquares = currentSquares.slice();
                    nextSquares[randomIndex] = 'O';
                    setSquares(nextSquares);
                    setXIsNext(true);
                }, 500);
                return;
             }
        }
       const bestMove = minimax(squares, true);
       if (bestMove.index !== undefined) {
         setTimeout(() => {
            const currentSquares = squares;
            if (calculateWinner(currentSquares) || isBoardFull(currentSquares)) return;
            const nextSquares = currentSquares.slice();
            nextSquares[bestMove.index!] = 'O';
            setSquares(nextSquares);
            setXIsNext(true);
         }, 500);
       }
    }
  };

  useEffect(() => {
    if (gameMode === 'ai' && !xIsNext && !winner && !isDraw) {
      aiMove();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xIsNext, gameMode, winner, isDraw, squares]);

  const renderSquare = (i: number) => {
    return (
      <button
        key={i}
        className={cn(
            "aspect-square w-24 h-24 flex items-center justify-center text-5xl font-bold rounded-md transition-colors",
            "bg-secondary hover:bg-secondary/80",
            squares[i] === 'X' ? 'text-primary' : 'text-accent'
        )}
        onClick={() => handleClick(i)}
      >
        {squares[i]}
      </button>
    );
  };
  

  return (
     <div className="flex flex-col items-center w-full max-w-4xl">
       <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
        <div className="text-right min-w-[150px]">
            <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
        </div>
      </div>
      
       {!winner && !isDraw && (
        <div className="mb-4">
          <RadioGroup value={gameMode} onValueChange={(value) => { handleRestart(); setGameMode(value as GameMode) }} className="flex gap-4">
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
      )}

      <div className="mb-4 text-2xl font-semibold">{status}</div>
      <div className="grid grid-cols-3 gap-2">
        {Array(9).fill(null).map((_, i) => renderSquare(i))}
      </div>
      {(winner || isDraw) && (
         <div className="text-center flex flex-col items-center mt-4">
            <HighScoreDialog 
                open={showHighScoreDialog} 
                onOpenChange={setShowHighScoreDialog}
                score={score}
                gameName={GAME_NAME}
                onSave={(playerName) => addHighScore({ score, playerName })}
            />
            <Button onClick={handleRestart} className="mt-6" size="lg">Play Again</Button>
            {gameMode === 'ai' && (
              <DifficultyAdjuster 
                gameName="Tic-Tac-Toe AI"
                playerScore={score}
                currentDifficulty={difficulty}
                onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
              />
            )}
        </div>
      )}
    </div>
  );
}
