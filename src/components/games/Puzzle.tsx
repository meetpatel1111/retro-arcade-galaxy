
"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import HighScoreDialog from '../HighScoreDialog';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import AiBanterBox from '../AiBanterBox';

const GAME_ID = 'puzzle';
const GAME_NAME = 'Sliding Puzzle';
const TILE_COUNT = 9;
const GRID_SIZE = 3;

type Difficulty = 'beginner' | 'intermediate' | 'expert';

const DIFFICULTY_SETTINGS = {
  beginner: { shuffles: 20 },
  intermediate: { shuffles: 50 },
  expert: { shuffles: 100 },
};

const createSolvedTiles = () => Array.from({ length: TILE_COUNT }, (_, i) => (i === TILE_COUNT - 1 ? null : i + 1));

const isSolvable = (tiles: (number|null)[]) => {
    let product = 1;
    for (let i = 1, l = TILE_COUNT - 1; i <= l; i++) {
        for (let j = i + 1, m = l + 1; j <= m; j++) {
            product *= (tiles.indexOf(i) - tiles.indexOf(j)) / (i - j);
        }
    }
    return product === 1;
}

const shuffleTiles = (tiles: (number | null)[], shuffles: number) => {
  let newTiles = [...tiles];
  let solvable = false;
  while (!solvable) {
    for (let i = 0; i < shuffles; i++) {
        const emptyIndex = newTiles.indexOf(null);
        const validMoves: number[] = [];
        // left
        if (emptyIndex % GRID_SIZE > 0) validMoves.push(emptyIndex - 1);
        // right
        if (emptyIndex % GRID_SIZE < GRID_SIZE - 1) validMoves.push(emptyIndex + 1);
        // up
        if (emptyIndex >= GRID_SIZE) validMoves.push(emptyIndex - GRID_SIZE);
        // down
        if (emptyIndex < TILE_COUNT - GRID_SIZE) validMoves.push(emptyIndex + GRID_SIZE);

        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        [newTiles[emptyIndex], newTiles[randomMove]] = [newTiles[randomMove], newTiles[emptyIndex]];
    }
    // Create a version of the array for the solvability check (replace null with TILE_COUNT)
    const checkableTiles = newTiles.map(t => t === null ? TILE_COUNT : t);
    if (isSolvable(checkableTiles)) {
      solvable = true;
    } else {
      newTiles = [...tiles]; // Reset and try again
    }
  }

  return newTiles;
};

export default function Puzzle() {
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);

  const initializeGame = useCallback(() => {
    const solved = createSolvedTiles();
    const shuffles = DIFFICULTY_SETTINGS[difficulty].shuffles;
    setTiles(shuffleTiles(solved, shuffles));
    setMoves(0);
    setIsSolved(false);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  const score = Math.max(0, 1000 - moves * 10);

  useEffect(() => {
    const checkSolved = () => {
      for (let i = 0; i < TILE_COUNT - 1; i++) {
        if (tiles[i] !== i + 1) return false;
      }
      return tiles[TILE_COUNT - 1] === null;
    };
    if(tiles.length > 0) {
      const solved = checkSolved();
      setIsSolved(solved);
      if (solved && isHighScore(score)) {
        setShowHighScoreDialog(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles]);

  const handleTileClick = (index: number) => {
    if (isSolved) return;
    const emptyIndex = tiles.indexOf(null);
    if(emptyIndex === -1) return;

    const isAdjacent =
      (Math.abs(index - emptyIndex) === 1 && Math.floor(index / GRID_SIZE) === Math.floor(emptyIndex / GRID_SIZE)) ||
      (Math.abs(index - emptyIndex) === GRID_SIZE);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(moves + 1);
    }
  };

  const getGameOutcome = () => {
    if (!isSolved) return null;
    return 'win';
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
       <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
        <div className="flex items-center gap-4">
             <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
            <div className="text-right min-w-[100px]">
              <p>Score: <span className="font-bold text-accent">{score}</span></p>
              <p>Moves: <span className="font-bold text-accent">{moves}</span></p>
            </div>
        </div>
      </div>

      <div className="relative w-[312px] h-[312px] bg-card rounded-lg p-1 grid grid-cols-3 gap-1">
        {tiles.map((tile, index) => (
          <div
            key={index}
            onClick={() => handleTileClick(index)}
            className={cn(
              "w-24 h-24 flex items-center justify-center text-4xl font-bold rounded-md transition-all duration-300",
              tile ? "bg-secondary text-primary cursor-pointer hover:bg-secondary/80" : "bg-transparent cursor-default",
               isSolved && tile ? "bg-primary text-primary-foreground" : ""
            )}
          >
            {tile}
          </div>
        ))}
      </div>
       {isSolved && (
        <div className="text-center flex flex-col items-center mt-4">
          <h2 className="text-5xl font-bold text-primary mb-4">You Solved It!</h2>
          <HighScoreDialog
            open={showHighScoreDialog}
            onOpenChange={setShowHighScoreDialog}
            score={score}
            gameName={GAME_NAME}
            onSave={(playerName, avatar) => addHighScore({ score, playerName, avatarDataUri: avatar })}
          />
          <p className="text-2xl mb-2">Final Score: {score}</p>
          <p className="text-xl text-muted-foreground mb-6">Total Moves: {moves}</p>
          <Button onClick={initializeGame} size="lg">Play Again</Button>
          <DifficultyAdjuster 
            gameName="Sliding Puzzle"
            playerScore={score}
            currentDifficulty={difficulty}
            onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
          />
          <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} score={score} />
        </div>
      )}
    </div>
  );
}
