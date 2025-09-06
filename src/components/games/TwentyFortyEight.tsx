
"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import { cn } from '@/lib/utils';

const GAME_ID = '2048';
const GAME_NAME = '2048';

const GRID_SIZE = 4;

const createEmptyBoard = (): (number | null)[][] => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const addRandomTile = (board: (number | null)[][]): (number | null)[][] => {
  const newBoard = board.map(row => [...row]);
  const emptyTiles: { r: number; c: number }[] = [];
  newBoard.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === null) {
        emptyTiles.push({ r, c });
      }
    });
  });

  if (emptyTiles.length > 0) {
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newBoard;
};

const rotateBoard = (board: (number | null)[][]): (number | null)[][] => {
    const newBoard = createEmptyBoard();
    for(let r=0; r<GRID_SIZE; r++) {
        for(let c=0; c<GRID_SIZE; c++) {
            newBoard[r][c] = board[GRID_SIZE - 1 - c][r];
        }
    }
    return newBoard;
};

const slideAndCombine = (row: (number | null)[]): { newRow: (number | null)[], points: number } => {
    const filteredRow = row.filter(tile => tile !== null);
    const newRow: (number | null)[] = [];
    let points = 0;
    
    for (let i = 0; i < filteredRow.length; i++) {
        if (i + 1 < filteredRow.length && filteredRow[i] === filteredRow[i+1]) {
            const newValue = filteredRow[i]! * 2;
            newRow.push(newValue);
            points += newValue;
            i++;
        } else {
            newRow.push(filteredRow[i]);
        }
    }
    
    while(newRow.length < GRID_SIZE) {
        newRow.push(null);
    }
    
    return { newRow, points };
};


export default function TwentyFortyEight() {
  const [board, setBoard] = useState<(number | null)[][]>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);

  const startGame = useCallback(() => {
    let newBoard = addRandomTile(createEmptyBoard());
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);
  
  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    
    let currentBoard = board.map(row => [...row]);
    let totalPoints = 0;
    
    // Rotate board to make every move a 'left' move
    let rotations = 0;
    if (direction === 'up') rotations = 1;
    if (direction === 'right') rotations = 2;
    if (direction === 'down') rotations = 3;
    
    for(let i=0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard);
    }
    
    const newBoard = currentBoard.map(row => {
      const { newRow, points } = slideAndCombine(row);
      totalPoints += points;
      return newRow;
    });

    // Rotate back
    for(let i=0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard); // For comparison
      newBoard.forEach((row, r) => {
        newBoard[r] = rotateBoard([newBoard[r]])[0].reverse();
      });
      newBoard.reverse();
    }
    // Correct way to rotate back
     let rotatedBackBoard = newBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
       rotatedBackBoard = rotateBoard(rotatedBackBoard);
    }

    const hasChanged = JSON.stringify(board) !== JSON.stringify(rotatedBackBoard);

    if (hasChanged) {
        const boardWithNewTile = addRandomTile(rotatedBackBoard);
        setBoard(boardWithNewTile);
        setScore(s => s + totalPoints);
        checkEndConditions(boardWithNewTile);
    }
  };

  const checkEndConditions = (currentBoard: (number|null)[][]) => {
     // Check for 2048
    if (currentBoard.flat().includes(2048)) {
      setGameWon(true);
    }
    
    // Check for game over (no possible moves)
    let canMove = false;
    for(let r=0; r<GRID_SIZE; r++) {
        for(let c=0; c<GRID_SIZE; c++) {
            if (currentBoard[r][c] === null) canMove = true;
            if (r + 1 < GRID_SIZE && currentBoard[r][c] === currentBoard[r+1][c]) canMove = true;
            if (c + 1 < GRID_SIZE && currentBoard[r][c] === currentBoard[r][c+1]) canMove = true;
        }
    }
    
    if(!canMove) {
        setGameOver(true);
        if (isHighScore(score)) setShowHighScoreDialog(true);
    }
  }


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  const getTileColor = (value: number | null) => {
    if (value === null) return 'bg-card/50';
    if (value === 2) return 'bg-gray-200 text-gray-800';
    if (value === 4) return 'bg-gray-300 text-gray-800';
    if (value === 8) return 'bg-orange-300 text-white';
    if (value === 16) return 'bg-orange-400 text-white';
    if (value === 32) return 'bg-orange-500 text-white';
    if (value === 64) return 'bg-orange-600 text-white';
    if (value === 128) return 'bg-yellow-400 text-white';
    if (value === 256) return 'bg-yellow-500 text-white';
    if (value === 512) return 'bg-yellow-600 text-white';
    if (value === 1024) return 'bg-primary/80 text-white';
    if (value === 2048) return 'bg-primary text-white text-4xl shadow-lg shadow-primary/50';
    return 'bg-black text-white';
  };
  
  const getGameOutcome = () => {
    if (!gameOver) return null;
    return gameWon ? 'win' : 'loss';
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
      
      <div className="relative p-4 bg-secondary rounded-lg">
        <div className="grid grid-cols-4 gap-4">
            {board.map((row, r) =>
            row.map((cell, c) => (
                <div key={`${r}-${c}`} className={cn(
                    "w-24 h-24 rounded-lg flex items-center justify-center text-5xl font-bold transition-all duration-200",
                    getTileColor(cell)
                )}>
                {cell}
                </div>
            ))
            )}
        </div>
         {(gameOver || gameWon) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-center p-4">
                <h2 className="text-5xl font-bold text-primary mb-4">
                    {gameWon ? "You Win!" : "Game Over!"}
                </h2>
                <p className="text-2xl mb-4">Final Score: {score}</p>
                <HighScoreDialog
                  open={showHighScoreDialog}
                  onOpenChange={setShowHighScoreDialog}
                  score={score}
                  gameName={GAME_NAME}
                  onSave={(name) => addHighScore({ playerName: name, score })}
                />
                <Button onClick={startGame} size="lg">Play Again</Button>
                <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} />
            </div>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Controls: Arrow Keys</p>
    </div>
  );
}
