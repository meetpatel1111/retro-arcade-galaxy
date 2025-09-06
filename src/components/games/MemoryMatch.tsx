
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

const GAME_ID = 'memory-match';
const GAME_NAME = 'Memory Match';

const LEVEL_SETTINGS = [
  { level: 1, pairs: 4, size: 'w-24 h-24', grid: 'grid-cols-4' },
  { level: 2, pairs: 6, size: 'w-24 h-24', grid: 'grid-cols-4' },
  { level: 3, pairs: 8, size: 'w-20 h-20', grid: 'grid-cols-4' },
  { level: 4, pairs: 10, size: 'w-20 h-20', grid: 'grid-cols-5' },
  { level: 5, pairs: 12, size: 'w-16 h-16', grid: 'grid-cols-6' },
];

const ICONS = [ '⭐', '🌙', '☀️', '❤️', '⚡', '⚙️', '⚛️', '☣️', '⚠️', '✅', '⚽', '⚓' ];

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
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);

  const { pairs, size, grid } = LEVEL_SETTINGS[level - 1];

  const initializeGame = useCallback((startLevel = 1) => {
    setLevel(startLevel);
    const { pairs } = LEVEL_SETTINGS[startLevel - 1];
    setCards(createBoard(pairs));
    setFlippedCards([]);
    setMoves(0);
    setScore(startLevel === 1 ? 0 : score);
    setGameOver(false);
  }, [score]);

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
  
  const levelScore = Math.max(0, 1000 - moves * 10 - (pairs * 5));

  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every(c => c.isMatched);
    if (allMatched) {
        setScore(s => s + levelScore);
        if (level < LEVEL_SETTINGS.length) {
            setTimeout(() => {
              initializeGame(level + 1);
            }, 1000);
        } else {
            setGameOver(true);
            if (isHighScore(score + levelScore)) {
                setShowHighScoreDialog(true);
            }
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
            <p>Level: <span className="font-bold text-accent">{level}</span></p>
            <p>Moves: <span className="font-bold text-accent">{moves}</span></p>
          </div>
        </div>
      </div>

      {gameOver ? (
         <div className="text-center flex flex-col items-center">
            <h2 className="text-5xl font-bold text-primary mb-4">
                {level < LEVEL_SETTINGS.length ? 'Get Ready!' : 'You Win!'}
            </h2>
             <HighScoreDialog
                open={showHighScoreDialog}
                onOpenChange={setShowHighScoreDialog}
                score={score + levelScore}
                gameName={GAME_NAME}
                onSave={(playerName) => addHighScore({ score: score + levelScore, playerName })}
            />
            <p className="text-2xl mb-2">Final Score: {score}</p>
            <Button onClick={() => initializeGame(1)} size="lg">Start Game</Button>
            <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} />
        </div>
      ) : (
        <div className={`grid ${grid} gap-4`}>
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
                <div className="absolute w-full h-full backface-hidden rounded-lg bg-secondary flex items-center justify-center cursor-pointer text-primary text-4xl">
                    ?
                </div>
                <div className="absolute w-full h-full backface-hidden rounded-lg bg-card flex items-center justify-center rotate-y-180 text-4xl">
                    {card.icon}
                </div>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
}
