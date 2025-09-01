"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import HighScoreDialog from '../HighScoreDialog';
import { Trophy, Star, Lightbulb, Bot } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import AiBanterBox from '../AiBanterBox';
import { suggestMinigame } from '@/ai/flows/ai-minigame-suggestion';

const GAME_ID = 'memory-match';
const GAME_NAME = 'Memory Match';

type Difficulty = 'beginner' | 'intermediate' | 'expert';
const DIFFICULTY_SETTINGS = {
  beginner: { pairs: 6, size: 'w-24 h-24' },
  intermediate: { pairs: 8, size: 'w-20 h-20' },
  expert: { pairs: 10, size: 'w-16 h-16' },
};

const ICONS = [ '⭐', '🌙', '☀️', '❤️', '⚡', '⚙️', '⚛️', '☣️', '⚠️', '✅' ];

type Card = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const createBoard = (pairs: number): Card[] => {
  const icons = ICONS.slice(0, pairs);
  const cards = [...icons, ...icons]
    .map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5);
  return cards;
};

export default function MemoryMatch() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);

  const { pairs, size } = DIFFICULTY_SETTINGS[difficulty];
  const gridCols = pairs === 6 ? 'grid-cols-4' : pairs === 8 ? 'grid-cols-4' : 'grid-cols-5';

  const initializeGame = useCallback(() => {
    setCards(createBoard(pairs));
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
  }, [pairs]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (id: number) => {
    if (gameOver || flippedCards.length === 2 || cards.find(c => c.id === id)?.isFlipped) {
      return;
    }

    const newCards = cards.map(card =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard?.icon === secondCard?.icon) {
        // Match
        const newCards = cards.map(card =>
          card.icon === firstCard.icon ? { ...card, isMatched: true } : card
        );
        setCards(newCards);
        setFlippedCards([]);
      } else {
        // No match
        setTimeout(() => {
          const newCards = cards.map(card =>
            card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card
          );
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, moves]);

  const score = Math.max(0, 1000 - moves * 10 - (pairs * 5));

  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every(c => c.isMatched);
    if (allMatched) {
      setGameOver(true);
      if (isHighScore(score)) {
        setShowHighScoreDialog(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const getGameOutcome = () => {
    if (!gameOver) return null;
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

      <div className={`grid ${gridCols} gap-4`}>
        {cards.map(card => (
          <div
            key={card.id}
            className={cn("perspective-1000", size)}
            onClick={() => handleCardClick(card.id)}
          >
            <div className={cn(
              "relative w-full h-full transition-transform duration-500 transform-style-3d",
              card.isFlipped || card.isMatched ? "rotate-y-180" : ""
            )}>
              <div className="absolute w-full h-full backface-hidden rounded-lg bg-secondary flex items-center justify-center cursor-pointer">
                 <Star className="w-1/2 h-1/2 text-primary" />
              </div>
              <div className="absolute w-full h-full backface-hidden rounded-lg bg-card flex items-center justify-center rotate-y-180 text-4xl">
                 {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="text-center flex flex-col items-center mt-4">
          <h2 className="text-5xl font-bold text-primary mb-4">You Win!</h2>
          <HighScoreDialog
            open={showHighScoreDialog}
            onOpenChange={setShowHighScoreDialog}
            score={score}
            gameName={GAME_NAME}
            onSave={(playerName) => addHighScore({ score, playerName })}
          />
          <p className="text-2xl mb-2">Final Score: {score}</p>
          <p className="text-xl text-muted-foreground mb-6">Total Moves: {moves}</p>
          <Button onClick={initializeGame} size="lg">Play Again</Button>
          <DifficultyAdjuster
            gameName={GAME_NAME}
            playerScore={score}
            currentDifficulty={difficulty}
            onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
          />
          <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} />
        </div>
      )}
    </div>
  );
}
