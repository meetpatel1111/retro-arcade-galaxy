"use client"

import { useState, useEffect, useCallback } from 'react';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { Gamepad2, Gift, Ghost, Heart, Star, Sun, Rocket, Bomb, Skull, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const ICONS = [Gamepad2, Gift, Ghost, Heart, Star, Sun, Rocket, Bomb, Skull, Crown];

type CardState = {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  isFlipped: boolean;
  isMatched: boolean;
};

const DIFFICULTY_SETTINGS = {
  beginner: { pairs: 6, grid: 'grid-cols-4 grid-rows-3', name: 'beginner' },
  intermediate: { pairs: 8, grid: 'grid-cols-4 grid-rows-4', name: 'intermediate' },
  expert: { pairs: 10, grid: 'grid-cols-5 grid-rows-4', name: 'expert' },
};

type Difficulty = keyof typeof DIFFICULTY_SETTINGS;

export default function MemoryMatch() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const createBoard = useCallback(() => {
    const { pairs } = DIFFICULTY_SETTINGS[difficulty];
    const selectedIcons = ICONS.slice(0, pairs);
    const gameIcons = [...selectedIcons, ...selectedIcons];
    const shuffledIcons = gameIcons.sort(() => Math.random() - 0.5);
    setCards(
      shuffledIcons.map((Icon, index) => ({
        id: index,
        icon: Icon,
        isFlipped: false,
        isMatched: false,
      }))
    );
    setMoves(0);
    setScore(0);
    setFlippedIndices([]);
    setGameOver(false);
    setIsChecking(false);
  }, [difficulty]);

  useEffect(() => {
    createBoard();
  }, [createBoard]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameOver(true);
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.icon === secondCard.icon) {
        setScore(prev => prev + 20);
        setCards(prev => prev.map(card => 
          (card.id === firstIndex || card.id === secondIndex) ? { ...card, isMatched: true, isFlipped: true } : card
        ));
        setFlippedIndices([]);
        setIsChecking(false);
      } else {
        setScore(prev => Math.max(0, prev - 5));
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            (card.id === firstIndex || card.id === secondIndex) ? { ...card, isFlipped: false } : card
          ));
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const { grid } = DIFFICULTY_SETTINGS[difficulty];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">Memory Match</h1>
        <div className="text-right min-w-[100px]">
          <p>Score: <span className="font-bold text-accent">{score}</span></p>
          <p>Moves: <span className="font-bold text-accent">{moves}</span></p>
        </div>
      </div>

      {!gameOver ? (
        <div className={`grid ${grid} gap-4`}>
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={cn(
                  'aspect-square rounded-lg cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]',
                  card.isFlipped ? '[transform:rotateY(180deg)]' : ''
                )}
                onClick={() => handleCardClick(index)}
              >
                <div className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80">
                  <Gamepad2 className="w-1/2 h-1/2 text-primary/50" />
                </div>
                <div className={cn("absolute w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center rounded-lg bg-card border-2", card.isMatched ? 'border-primary' : 'border-border')}>
                  <Icon className={cn('w-1/2 h-1/2', card.isMatched ? 'text-primary' : 'text-accent')} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center flex flex-col items-center">
          <h2 className="text-5xl font-bold text-primary mb-4">You Win!</h2>
          <p className="text-2xl mb-2">Final Score: {score}</p>
          <p className="text-xl text-muted-foreground mb-6">Total Moves: {moves}</p>
          <Button onClick={createBoard} size="lg">Play Again</Button>
          <DifficultyAdjuster 
            gameName="Memory Match"
            playerScore={score}
            currentDifficulty={difficulty}
            onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
          />
        </div>
      )}
    </div>
  );
}
