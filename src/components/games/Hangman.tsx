
"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { Skeleton } from '../ui/skeleton';
import { generateHangmanWord } from '@/ai/flows/ai-hangman-word';

const GAME_ID = 'hangman';
const GAME_NAME = 'Hangman';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_MISTAKES = 6;

type Difficulty = 'beginner' | 'intermediate' | 'expert';

const HANGMAN_PICS = [
`
  +---+
  |   |
      |
      |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
`
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
];

export default function Hangman() {
    const [wordToGuess, setWordToGuess] = useState('');
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [mistakes, setMistakes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [isLoading, setIsLoading] = useState(true);
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    const { isHighScore, addHighScore } = useHighScores(GAME_ID);

    const startGame = useCallback(async () => {
        setIsLoading(true);
        setGuessedLetters([]);
        setMistakes(0);
        setGameOver(false);
        setGameWon(false);
        try {
            const { word } = await generateHangmanWord({ difficulty });
            setWordToGuess(word.toLowerCase());
        } catch (error) {
            console.error("Failed to fetch word for Hangman:", error);
            const fallbacks = { beginner: 'game', intermediate: 'player', expert: 'arcade' };
            setWordToGuess(fallbacks[difficulty]);
        } finally {
            setIsLoading(false);
        }
    }, [difficulty]);

    useEffect(() => {
        startGame();
    }, [startGame, difficulty]);

    const handleGuess = (letter: string) => {
        if (gameOver || guessedLetters.includes(letter) || isLoading) return;
        
        const newGuessedLetters = [...guessedLetters, letter];
        setGuessedLetters(newGuessedLetters);

        if (!wordToGuess.includes(letter)) {
            setMistakes(m => m + 1);
        }
    };
    
    const score = Math.max(0, (wordToGuess.length * 10) - (mistakes * 20) + (difficulty === 'intermediate' ? 50 : difficulty === 'expert' ? 100 : 0));

    useEffect(() => {
        if (!wordToGuess || isLoading) return;

        if (mistakes >= MAX_MISTAKES) {
            setGameOver(true);
            setGameWon(false);
        }
        
        const isWordGuessed = wordToGuess.split('').every(letter => guessedLetters.includes(letter));
        if (isWordGuessed) {
            setGameOver(true);
            setGameWon(true);
            if (isHighScore(score)) {
                setShowHighScoreDialog(true);
            }
        }
    }, [mistakes, guessedLetters, wordToGuess, score, isHighScore, isLoading]);
    
    const getGameOutcome = () => {
        if(!gameOver) return null;
        return gameWon ? 'win' : 'loss';
    }

    const maskedWord = wordToGuess
        .split('')
        .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
        .join(' ');

    return (
        <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
                <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
                <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
                <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                <pre className="text-2xl font-mono bg-secondary/30 p-4 rounded-lg text-primary min-w-[220px]">
                    {HANGMAN_PICS[mistakes]}
                </pre>
                <div className="flex flex-col items-center gap-8">
                    {isLoading ? (
                         <Skeleton className="h-12 w-64" />
                    ): (
                        <p className="text-5xl tracking-[0.5em] font-bold min-h-[5rem] flex items-center">{maskedWord}</p>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center max-w-md">
                        {ALPHABET.map(letter => (
                            <Button
                                key={letter}
                                variant="outline"
                                size="icon"
                                onClick={() => handleGuess(letter)}
                                disabled={guessedLetters.includes(letter) || gameOver || isLoading}
                                className="w-10 h-10 text-xl"
                            >
                                {letter.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {gameOver && (
                <div className="text-center flex flex-col items-center mt-8">
                    <h2 className="text-5xl font-bold mb-4">
                        {gameWon ? 'You Win!' : 'Game Over!'}
                    </h2>
                    {!gameWon && <p className="text-2xl text-muted-foreground mb-4">The word was: <span className="text-primary">{wordToGuess}</span></p>}
                    <HighScoreDialog
                        open={showHighScoreDialog}
                        onOpenChange={setShowHighScoreDialog}
                        score={score}
                        gameName={GAME_NAME}
                        onSave={(playerName) => addHighScore({ score, playerName })}
                    />
                    <Button onClick={startGame} size="lg">Play Again</Button>
                    <DifficultyAdjuster
                        gameName={GAME_NAME}
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
