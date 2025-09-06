
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy, Keyboard } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { generateTypingTestWords } from '@/ai/flows/ai-typing-test-words';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

const GAME_ID = 'typing-speed-test';
const GAME_NAME = 'Typing Speed Test';
const GAME_DURATION_S = 60;

type Difficulty = 'beginner' | 'intermediate' | 'expert';

export default function TypingSpeedTest() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<{ wpm: number; accuracy: number } | null>(null);

  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);

  const { isHighScore, addHighScore } = useHighScores(GAME_ID);
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const { words } = await generateTypingTestWords({ difficulty, count: 50 });
      setWords(words);
    } catch (error) {
      console.error("Failed to fetch words:", error);
      const fallbackWords = "the quick brown fox jumps over the lazy dog test speed type arcade game fun play now".split(" ");
      setWords(fallbackWords);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    if (isGameRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (isGameRunning && timeLeft === 0) {
      endGame();
    }
  }, [isGameRunning, timeLeft]);

  const startGame = () => {
    if (words.length === 0) return;
    setIsGameRunning(true);
    setCurrentWordIndex(0);
    setInputValue('');
    setTimeLeft(GAME_DURATION_S);
    setResults(null);
    setCorrectChars(0);
    setTotalChars(0);
    setShowHighScoreDialog(false);
    inputRef.current?.focus();
  };

  const endGame = () => {
    setIsGameRunning(false);
    const minutes = GAME_DURATION_S / 60;
    const wpm = Math.round(correctChars / 5 / minutes);
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    setResults({ wpm, accuracy });

    if (isHighScore(wpm)) {
      setShowHighScoreDialog(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isGameRunning) return;
    const value = e.target.value;

    if (value.endsWith(' ')) {
      const currentWord = words[currentWordIndex];
      const typedWord = value.trim();
      
      if (typedWord === currentWord) {
        setCorrectChars(prev => prev + currentWord.length + 1); // +1 for space
      }
      setTotalChars(prev => prev + currentWord.length + 1);
      
      setCurrentWordIndex(prev => prev + 1);
      setInputValue('');
    } else {
      setInputValue(value);
    }
  };

  const getGameOutcome = () => {
    if (!results) return null;
    return results.wpm > 40 ? 'win' : 'loss';
  }
  
  const score = results?.wpm || 0;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
        <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
        <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
        <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
      </div>

      <div className="w-full p-4 mb-4 bg-card/50 border border-border rounded-lg flex justify-around text-xl font-bold">
        <div>Time Left: <span className="text-accent">{timeLeft}</span></div>
        <div>WPM: <span className="text-accent">{results?.wpm ?? 0}</span></div>
        <div>Accuracy: <span className="text-accent">{results?.accuracy ?? 100}%</span></div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-48" />
      ) : (
        <div className="w-full h-48 p-4 bg-secondary rounded-lg text-2xl font-mono leading-relaxed overflow-hidden relative">
          {!isGameRunning && !results && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                <h2 className="text-3xl font-bold text-primary mb-4">Press Start to Begin</h2>
              </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {words.map((word, index) => {
              const isCurrent = index === currentWordIndex;
              const isTyped = index < currentWordIndex;
              let charClassName = '';
              if (isCurrent) {
                  for (let i = 0; i < word.length; i++) {
                     if (inputValue[i] === undefined) break;
                     if (inputValue[i] !== word[i]) {
                         charClassName = 'text-destructive';
                         break;
                     }
                  }
              }
              return (
                <span key={index} className={cn(
                  'transition-colors',
                  isTyped && 'text-primary',
                  isCurrent && 'text-accent underline',
                  isCurrent && charClassName,
                )}>
                  {word}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-4 w-full flex gap-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="flex-grow bg-card p-4 text-2xl font-mono rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={!isGameRunning || isLoading}
          placeholder={isGameRunning ? "Type here..." : ""}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <Button onClick={startGame} size="lg" disabled={isGameRunning || isLoading} className="h-auto">
          Start
        </Button>
      </div>
      
      {results && (
        <div className="text-center flex flex-col items-center mt-4">
            <h2 className="text-4xl font-bold text-primary mb-4">Time's Up!</h2>
            <HighScoreDialog
                open={showHighScoreDialog}
                onOpenChange={setShowHighScoreDialog}
                score={score}
                gameName={GAME_NAME}
                onSave={(playerName, avatar) => addHighScore({ score, playerName, avatarDataUri: avatar })}
            />
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
