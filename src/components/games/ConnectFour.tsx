
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import HighScoreDialog from '../HighScoreDialog';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import AiBanterBox from '../AiBanterBox';

const ROWS = 6;
const COLS = 7;
const GAME_ID = 'connect-four';
const GAME_NAME = 'Connect Four';

type Player = '1' | '2';
type Board = (Player | null)[][];
type GameMode = 'player' | 'ai';
type Difficulty = 'beginner' | 'intermediate' | 'expert';

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
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);

  const handleColumnClick = (colIndex: number) => {
    if (winner || board[0][colIndex] || (gameMode === 'ai' && currentPlayer === '2')) return;

    placePiece(colIndex, currentPlayer);
  };

  const placePiece = (colIndex: number, player: Player) => {
    const newBoard = board.map(row => [...row]);
    let placed = false;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!newBoard[r][colIndex]) {
        newBoard[r][colIndex] = player;
        placed = true;
        break;
      }
    }
    
    if (placed) {
      setBoard(newBoard);
      const newWinner = checkWin(newBoard);
      if (newWinner) {
        setWinner(newWinner);
        const score = newWinner === '1' ? 100 : (newWinner === '2' ? 0 : 50);
        if (gameMode === 'ai' && isHighScore(score)) {
            setShowHighScoreDialog(true);
        }
      } else if (isBoardFull(newBoard)) {
        setIsDraw(true);
      } else {
        setCurrentPlayer(player === '1' ? '2' : '1');
      }
    }
  }
  
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

  const aiMove = () => {
    const availableColumns = [];
    for (let c = 0; c < COLS; c++) {
      if (!board[0][c]) {
        availableColumns.push(c);
      }
    }

    if(availableColumns.length > 0) {
      // Beginner: random move
      if (difficulty === 'beginner' || (difficulty === 'intermediate' && Math.random() < 0.5)) {
        const randomColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        setTimeout(() => placePiece(randomColumn, '2'), 500);
        return;
      }

      // Expert/Intermediate: Try to win or block
      for (const col of availableColumns) {
        // Check if AI can win
        const tempBoardWin = board.map(r => [...r]);
        for (let r = ROWS - 1; r >= 0; r--) {
          if (!tempBoardWin[r][col]) {
            tempBoardWin[r][col] = '2';
            if (checkWin(tempBoardWin) === '2') {
              setTimeout(() => placePiece(col, '2'), 500);
              return;
            }
            break;
          }
        }
        // Check if player is about to win and block
        const tempBoardBlock = board.map(r => [...r]);
         for (let r = ROWS - 1; r >= 0; r--) {
          if (!tempBoardBlock[r][col]) {
            tempBoardBlock[r][col] = '1';
             if (checkWin(tempBoardBlock) === '1') {
                setTimeout(() => placePiece(col, '2'), 500);
                return;
            }
            break;
          }
        }
      }
      
      const randomColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
      setTimeout(() => placePiece(randomColumn, '2'), 500);
    }
  }

  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === '2' && !winner && !isDraw) {
      aiMove();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameMode, winner, isDraw, board]);


  const score = winner === '1' ? 100 : (winner === '2' ? 0 : 50);
  
  const getGameOutcome = () => {
    if (gameMode !== 'ai' || (!winner && !isDraw)) return null;
    if (winner === '1') return 'win';
    if (winner === '2') return 'loss';
    return 'draw';
  }

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
              <>
                <DifficultyAdjuster 
                  gameName="Connect Four AI"
                  playerScore={score}
                  currentDifficulty={difficulty}
                  onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                />
                <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} />
              </>
            )}
        </div>
      )}
    </div>
  );
}
