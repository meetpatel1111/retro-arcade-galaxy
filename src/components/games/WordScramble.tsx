
"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DifficultyAdjuster from '../DifficultyAdjuster';
import HighScoreDialog from '../HighScoreDialog';
import { Trophy, Check, X } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import AiBanterBox from '../AiBanterBox';
import { generateScrambledWord } from '@/ai/flows/ai-word-scramble';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';

const GAME_ID = 'word-scramble';
const GAME_NAME = 'Word Scramble';
const GAME_DURATION_S = 60;

type Difficulty = 'beginner' | 'intermediate' | 'expert';

export default function WordScramble() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [originalWord, setOriginalWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [playerGuess, setPlayerGuess] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [gameOver, setGameOver] = useState(true);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const { isHighScore, addHighScore } = useHighScores(GAME_ID);

  const fetchNewWord = useCallback(async () => {
    setIsLoadingWord(true);
    let currentDifficulty = difficulty;
    if (level > 5 && difficulty === 'beginner') currentDifficulty = 'intermediate';
    if (level > 10 && difficulty === 'intermediate') currentDifficulty = 'expert';

    try {
      const { originalWord, scrambledWord } = await generateScrambledWord({ difficulty: currentDifficulty });
      setOriginalWord(originalWord);
      setScrambledWord(scrambledWord);
    } catch (error) {
      console.error("Failed to fetch new word:", error);
      // Fallback simple words
      const fallback = { beginner: 'game', intermediate: 'player', expert: 'arcade' };
      setOriginalWord(fallback[currentDifficulty]);
      setScrambledWord(fallback[currentDifficulty].split('').sort(() => 0.5 - Math.random()).join(''));
    } finally {
      setIsLoadingWord(false);
    }
  }, [difficulty, level]);

  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setPlayerGuess('');
    setFeedback(null);
    setTimeLeft(GAME_DURATION_S);
    setGameOver(false);
    setShowHighScoreDialog(false);
    fetchNewWord();
  }, [fetchNewWord]);

  useEffect(() => {
    if (!gameOver && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (!gameOver && timeLeft === 0) {
      setGameOver(true);
      if (isHighScore(score)) {
        setShowHighScoreDialog(true);
      }
    }
  }, [gameOver, timeLeft, score, isHighScore]);


  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameOver || !playerGuess) return;

    if (playerGuess.toLowerCase() === originalWord) {
      setScore(s => s + 100 + originalWord.length * 10);
      setLevel(l => l + 1);
      setFeedback('correct');
    } else {
      setScore(s => Math.max(0, s - 20));
      setFeedback('incorrect');
    }

    setPlayerGuess('');
    setTimeout(() => {
      setFeedback(null);
      fetchNewWord();
    }, 1000);
  };
  
  const getGameOutcome = () => {
    if (!gameOver || timeLeft > 0) return null;
    return score > 300 ? 'win' : 'loss';
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
        <div className='flex items-center gap-4'>
          <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
          <div className="text-right min-w-[100px]">
            <p>Score: <span className="font-bold text-accent">{score}</span></p>
            <p>Level: <span className="font-bold text-accent">{level}</span></p>
            <p>Time: <span className="font-bold text-accent">{timeLeft}</span></p>
          </div>
        </div>
      </div>

      {gameOver ? (
        <div className="text-center flex flex-col items-center">
          <h2 className="text-5xl font-bold text-primary mb-4">
            {score > 0 ? 'Time\'s Up!' : 'Get Ready!'}
          </h2>
          {score > 0 && <p className="text-2xl mb-6">Final Score: {score}</p>}
          <HighScoreDialog
            open={showHighScoreDialog}
            onOpenChange={setShowHighScoreDialog}
            score={score}
            gameName={GAME_NAME}
            onSave={(playerName) => addHighScore({ score, playerName })}
          />
          <Button onClick={startGame} size="lg">Start Game</Button>
          {score > 0 &&
            <div className="text-center flex flex-col items-center mt-4">
              <DifficultyAdjuster
                gameName={GAME_NAME}
                playerScore={score}
                currentDifficulty={difficulty}
                onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
              />
              <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} score={score} />
            </div>
          }
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <p className="text-lg text-muted-foreground">Unscramble the word:</p>
            {isLoadingWord ? (
                <Skeleton className="h-16 w-64" />
            ) : (
                <div className="relative">
                    <p className="text-6xl font-bold tracking-widest text-primary p-4 bg-secondary/50 rounded-lg">
                        {scrambledWord.toUpperCase()}
                    </p>
                    {feedback === 'correct' && <Check className="absolute -top-4 -right-4 w-12 h-12 text-green-500 bg-background rounded-full p-1" />}
                    {feedback === 'incorrect' && <X className="absolute -top-4 -right-4 w-12 h-12 text-destructive bg-background rounded-full p-1" />}
                </div>
            )}
          <form onSubmit={handleGuessSubmit} className="flex w-full gap-2">
            <Input
              type="text"
              value={playerGuess}
              onChange={(e) => setPlayerGuess(e.target.value)}
              placeholder="Your guess..."
              className="text-center text-xl h-12"
              disabled={isLoadingWord || !!feedback}
            />
            <Button type="submit" size="lg" disabled={isLoadingWord || !!feedback}>Guess</Button>
          </form>
        </div>
      )}
    </div>
  );
}
