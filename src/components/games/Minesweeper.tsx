"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { Flag, Bomb, Check, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type Board = CellState[][];

const createEmptyBoard = (rows: number, cols: number): Board => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
};

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [board, setBoard] = useState<Board>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [timer, setTimer] = useState(0);

  const { rows, cols, mines } = DIFFICULTY_SETTINGS[difficulty];

  useEffect(() => {
    resetGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!firstClick && !gameOver) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [firstClick, gameOver]);


  const resetGame = () => {
    setBoard(createEmptyBoard(rows, cols));
    setGameOver(false);
    setGameWon(false);
    setFirstClick(true);
    setFlagsPlaced(0);
    setTimer(0);
  };

  const plantMinesAndCalculateNeighbors = (clickedRow: number, clickedCol: number) => {
    let newBoard = createEmptyBoard(rows, cols);
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!newBoard[r][c].isMine && !(r === clickedRow && c === clickedCol)) {
        newBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newBoard[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
              count++;
            }
          }
        }
        newBoard[r][c].adjacentMines = count;
      }
    }
    return newBoard;
  };
  
  const revealCell = (r: number, c: number, currentBoard: Board) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || currentBoard[r][c].isRevealed || currentBoard[r][c].isFlagged) {
      return;
    }
    
    currentBoard[r][c].isRevealed = true;

    if (currentBoard[r][c].adjacentMines === 0 && !currentBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          revealCell(r + dr, c + dc, currentBoard);
        }
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || gameWon) return;

    let currentBoard = board;
    if (firstClick) {
      currentBoard = plantMinesAndCalculateNeighbors(r, c);
      setFirstClick(false);
    }
    
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    if (newBoard[r][c].isFlagged) return;

    if (newBoard[r][c].isMine) {
      setGameOver(true);
      // Reveal all mines
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (newBoard[row][col].isMine) {
            newBoard[row][col].isRevealed = true;
          }
        }
      }
      setBoard(newBoard);
      return;
    }

    revealCell(r, c, newBoard);
    setBoard(newBoard);
    checkWinCondition(newBoard);
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || gameWon || board[r][c].isRevealed) return;
    
    const newBoard = [...board];
    const cell = newBoard[r][c];
    if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlagsPlaced(prev => prev - 1);
    } else if (flagsPlaced < mines) {
      cell.isFlagged = true;
      setFlagsPlaced(prev => prev + 1);
    }
    setBoard(newBoard);
  };
  
  const checkWinCondition = (currentBoard: Board) => {
    let revealedCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (currentBoard[r][c].isRevealed) {
          revealedCount++;
        }
      }
    }
    if (revealedCount === rows * cols - mines) {
      setGameWon(true);
      setGameOver(true);
    }
  };
  
  const getCellContent = (cell: CellState) => {
    if (cell.isFlagged) return <Flag className="w-4 h-4 text-accent" />;
    if (!cell.isRevealed) return null;
    if (cell.isMine) return <Bomb className="w-4 h-4 text-destructive" />;
    if (cell.adjacentMines > 0) return cell.adjacentMines;
    return null;
  };
  
  const getStatusMessage = () => {
    if (gameWon) return { text: "You Win!", icon: <Check className="text-primary"/> };
    if (gameOver) return { text: "Game Over", icon: <X className="text-destructive"/> };
    return { text: "Minesweeper", icon: <Bomb /> };
  }

  const score = gameWon ? Math.max(0, 10000 - timer * 10 - (100 - mines)) : 0;
  
  return (
    <div className="flex flex-col items-center w-full max-w-5xl">
      <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
            {getStatusMessage().icon} {getStatusMessage().text}
        </h1>
        <div className="text-right min-w-[200px] text-xl font-bold flex justify-end gap-4">
          <div className="flex items-center gap-2"><Flag className="text-accent" /> <span className="text-accent">{mines - flagsPlaced}</span></div>
          <div className="flex items-center gap-2"><span className="text-primary">Timer:</span> <span className="text-accent">{timer}</span></div>
        </div>
      </div>

      <div className="mb-4">
        <RadioGroup value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)} className="flex gap-4">
          <div className="flex items-center space-x-2"><RadioGroupItem value="beginner" id="beginner" /><Label htmlFor="beginner">Beginner</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="intermediate" id="intermediate" /><Label htmlFor="intermediate">Intermediate</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="expert" id="expert" /><Label htmlFor="expert">Expert</Label></div>
        </RadioGroup>
      </div>
      
      <div className="bg-card p-2 rounded-lg" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 25px)`, gap: '2px' }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              className={cn(
                "w-6 h-6 flex items-center justify-center font-bold text-sm rounded-sm",
                cell.isRevealed ? "bg-secondary/50" : "bg-secondary hover:bg-secondary/80",
                cell.isRevealed && cell.adjacentMines === 1 && "text-blue-400",
                cell.isRevealed && cell.adjacentMines === 2 && "text-green-400",
                cell.isRevealed && cell.adjacentMines === 3 && "text-red-400",
                cell.isRevealed && cell.adjacentMines >= 4 && "text-purple-400",
              )}
              disabled={gameOver || gameWon}
            >
              {getCellContent(cell)}
            </button>
          ))
        )}
      </div>
       {(gameOver || gameWon) && (
        <div className="text-center flex flex-col items-center mt-4">
            <Button onClick={resetGame} className="mt-6" size="lg">Play Again</Button>
            {gameWon && (
              <DifficultyAdjuster 
                gameName="Minesweeper"
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
