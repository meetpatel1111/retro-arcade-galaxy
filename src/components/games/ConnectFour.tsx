"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ROWS = 6;
const COLS = 7;

type Player = '1' | '2';
type Board = (Player | null)[][];

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function checkWin(board: Board): Player | null {
  // Check horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const slice = board[r].slice(c, c + 4);
      if (slice.every(cell => cell && cell === slice[0])) return slice[0];
    }
  }

  // Check vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const slice = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      if (slice.every(cell => cell && cell === slice[0])) return slice[0];
    }
  }

  // Check diagonal (down-right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const slice = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      if (slice.every(cell => cell && cell === slice[0])) return slice[0];
    }
  }
  
  // Check diagonal (up-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const slice = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      if (slice.every(cell => cell && cell === slice[0])) return slice[0];
    }
  }

  return null;
}

function isBoardFull(board: Board): boolean {
    return board.every(row => row.every(cell => cell !== null));
}

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('1');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  const handleColumnClick = (colIndex: number) => {
    if (winner || board[0][colIndex]) return;

    const newBoard = board.map(row => [...row]);
    let placed = false;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!newBoard[r][colIndex]) {
        newBoard[r][colIndex] = currentPlayer;
        placed = true;
        break;
      }
    }
    
    if (placed) {
      setBoard(newBoard);
      const newWinner = checkWin(newBoard);
      if (newWinner) {
        setWinner(newWinner);
      } else if (isBoardFull(newBoard)) {
        setIsDraw(true);
      } else {
        setCurrentPlayer(currentPlayer === '1' ? '2' : '1');
      }
    }
  };
  
  const handleRestart = () => {
      setBoard(createEmptyBoard());
      setCurrentPlayer('1');
      setWinner(null);
      setIsDraw(false);
  }

  const getStatusMessage = () => {
      if (winner) return `Player ${winner} wins!`;
      if (isDraw) return "It's a draw!";
      return `Player ${currentPlayer}'s turn`;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
       <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">Connect Four</h1>
        <div className="text-right min-w-[100px]">
        </div>
      </div>
      
      <div className="mb-4 text-2xl font-semibold">{getStatusMessage()}</div>

      <div className="p-4 bg-secondary rounded-lg grid gap-2" style={{gridTemplateColumns: `repeat(${COLS}, 1fr)`}}>
        {board.map((row, r) => 
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className="w-16 h-16 rounded-full bg-card flex items-center justify-center cursor-pointer" onClick={() => handleColumnClick(c)}>
                <div className={cn("w-14 h-14 rounded-full transition-colors", 
                    cell === '1' && 'bg-primary',
                    cell === '2' && 'bg-accent'
                )}></div>
            </div>
          ))
        )}
      </div>

       {(winner || isDraw) && (
        <Button onClick={handleRestart} className="mt-6" size="lg">Play Again</Button>
      )}
    </div>
  );
}
