
"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import HighScoreDialog from '../HighScoreDialog';
import { Trophy, Check, RefreshCw } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import AiBanterBox from '../AiBanterBox';
import { generatePuzzleImage } from '@/ai/flows/ai-generate-puzzle-image';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

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

const createSolvedTiles = () => Array.from({ length: TILE_COUNT }, (_, i) => (i === TILE_COUNT - 1 ? null : i));

const shuffleTiles = (tiles: (number | null)[], shuffles: number) => {
  let newTiles = [...tiles];
  for (let i = 0; i < shuffles * 2; i++) {
      const emptyIndex = newTiles.indexOf(null);
      const validMoves: number[] = [];
      if (emptyIndex % GRID_SIZE > 0) validMoves.push(emptyIndex - 1);
      if (emptyIndex % GRID_SIZE < GRID_SIZE - 1) validMoves.push(emptyIndex + 1);
      if (emptyIndex >= GRID_SIZE) validMoves.push(emptyIndex - GRID_SIZE);
      if (emptyIndex < TILE_COUNT - GRID_SIZE) validMoves.push(emptyIndex + GRID_SIZE);

      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [newTiles[emptyIndex], newTiles[randomMove]] = [newTiles[randomMove], newTiles[emptyIndex]];
  }
  return newTiles;
};

export default function Puzzle() {
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [imageTiles, setImageTiles] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);

  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    setMoves(0);
    setIsSolved(false);
    try {
        const { mainImageUri, tiles } = await generatePuzzleImage();
        setMainImage(mainImageUri);
        setImageTiles(tiles);
        const solved = createSolvedTiles();
        const shuffles = DIFFICULTY_SETTINGS[difficulty].shuffles;
        setTiles(shuffleTiles(solved, shuffles));
    } catch (e) {
        console.error("Failed to generate puzzle image", e);
        // Handle error, maybe show a fallback
    } finally {
        setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  const score = Math.max(0, 1000 - moves * 10);

  useEffect(() => {
    const checkSolved = () => {
      for (let i = 0; i < TILE_COUNT - 1; i++) {
        if (tiles[i] !== i) return false;
      }
      return tiles[TILE_COUNT - 1] === null;
    };
    if(tiles.length > 0 && !isLoading) {
      const solved = checkSolved();
      setIsSolved(solved);
      if (solved && isHighScore(score)) {
        setShowHighScoreDialog(true);
      }
    }
  }, [tiles, score, isHighScore, isLoading]);

  const handleTileClick = (index: number) => {
    if (isSolved || isLoading) return;
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
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-[312px] h-[312px] bg-card rounded-lg p-1 grid grid-cols-3 gap-1">
            {isLoading ? (
                 Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="w-[100px] h-[100px]" />)
            ) : tiles.map((tile, index) => (
              <div
                key={index}
                onClick={() => handleTileClick(index)}
                className={cn(
                  "w-[100px] h-[100px] flex items-center justify-center rounded-md transition-all duration-300 relative",
                  tile !== null ? "bg-secondary cursor-pointer" : "bg-transparent cursor-default",
                )}
              >
                {tile !== null && imageTiles[tile] &&
                    <Image src={imageTiles[tile]} layout="fill" alt={`tile-${tile}`} className="rounded-md" />
                }
              </div>
            ))}
             {isSolved && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-10">
                    <Check className="w-24 h-24 text-primary" />
                    <h3 className="text-3xl font-bold text-primary mt-2">Solved!</h3>
                </div>
             )}
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold text-primary">Goal Image</h3>
            {isLoading ? <Skeleton className="w-48 h-48 rounded-lg" /> :
             mainImage && <Image src={mainImage} width={192} height={192} alt="Puzzle to solve" className="rounded-lg border-2 border-primary" />
            }
             <Button onClick={initializeGame} disabled={isLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                New Puzzle
            </Button>
          </div>
      </div>


       {isSolved && (
        <div className="text-center flex flex-col items-center mt-4">
          <HighScoreDialog
            open={showHighScoreDialog}
            onOpenChange={setShowHighScoreDialog}
            score={score}
            gameName={GAME_NAME}
            onSave={(playerName, avatar) => addHighScore({ score, playerName, avatarDataUri: avatar })}
          />
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
