"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function calculateWinner(squares: (string | null)[]) {
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

function isBoardFull(squares: (string | null)[]) {
  return squares.every(square => square !== null);
}

export default function TicTacToe() {
  const [squares, setSquares] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(squares);
  const isDraw = !winner && isBoardFull(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "It's a Draw!";
  }
  else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  function handleClick(i: number) {
    if (squares[i] || winner) {
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
  }

  const renderSquare = (i: number) => {
    return (
      <button
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
        <h1 className="text-4xl font-bold text-primary">Tic-Tac-Toe</h1>
        <div className="text-right min-w-[100px]">
          {/* Placeholder for score if added later */}
        </div>
      </div>

      <div className="mb-4 text-2xl font-semibold">{status}</div>
      <div className="grid grid-cols-3 gap-2">
        {Array(9).fill(null).map((_, i) => renderSquare(i))}
      </div>
      {(winner || isDraw) && (
        <Button onClick={handleRestart} className="mt-6" size="lg">Play Again</Button>
      )}
    </div>
  );
}
