
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Hand, Scissors, Gem, Trophy } from 'lucide-react';
import { useHighScores } from '@/hooks/useHighScores';
import HighScoreDialog from '../HighScoreDialog';
import AiBanterBox from '../AiBanterBox';
import DifficultyAdjuster from '../DifficultyAdjuster';
import { cn } from '@/lib/utils';

const GAME_ID = 'rock-paper-scissors';
const GAME_NAME = 'Rock Paper Scissors';
type Choice = 'rock' | 'paper' | 'scissors';
const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];
const ICONS = {
    rock: <Gem className="w-16 h-16" />,
    paper: <Hand className="w-16 h-16" />,
    scissors: <Scissors className="w-16 h-16" />,
};

type Difficulty = 'beginner' | 'intermediate' | 'expert';

export default function RockPaperScissors() {
    const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
    const [aiChoice, setAiChoice] = useState<Choice | null>(null);
    const [result, setResult] = useState<'win' | 'loss' | 'draw' | null>(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [rounds, setRounds] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    const { isHighScore, addHighScore } = useHighScores(GAME_ID);

    const handlePlayerChoice = (choice: Choice) => {
        if (gameOver) return;

        const newAiChoice = getAiChoice(choice);
        const newResult = getResult(choice, newAiChoice);

        setPlayerChoice(choice);
        setAiChoice(newAiChoice);
        setResult(newResult);

        if (newResult === 'win') setPlayerScore(s => s + 1);
        if (newResult === 'loss') setAiScore(s => s + 1);
        
        const newRounds = rounds + 1;
        setRounds(newRounds);
        
        if (newRounds >= 5) {
            setGameOver(true);
        }
    };

    const getAiChoice = (playerPrevChoice: Choice): Choice => {
        const level = Math.floor(rounds / 2); // AI gets smarter every 2 rounds
        
        if (difficulty === 'beginner' && level < 1) { // Beginner AI is always random
            return CHOICES[Math.floor(Math.random() * CHOICES.length)];
        }
        
        const chanceToCounter = {
            beginner: 0.3,
            intermediate: 0.6,
            expert: 0.9
        }[difficulty] + level * 0.1;

        if (Math.random() < chanceToCounter) {
            return getWinningChoice(playerPrevChoice);
        }
        
        return CHOICES[Math.floor(Math.random() * CHOICES.length)];
    }

    const getWinningChoice = (choice: Choice): Choice => {
        if (choice === 'rock') return 'paper';
        if (choice === 'paper') return 'scissors';
        return 'rock';
    }

    const getResult = (player: Choice, ai: Choice) => {
        if (player === ai) return 'draw';
        if (
            (player === 'rock' && ai === 'scissors') ||
            (player === 'paper' && ai === 'rock') ||
            (player === 'scissors' && ai === 'paper')
        ) {
            return 'win';
        }
        return 'loss';
    };

    const restartGame = () => {
        setPlayerChoice(null);
        setAiChoice(null);
        setResult(null);
        setPlayerScore(0);
        setAiScore(0);
        setRounds(0);
        setGameOver(false);
    }
    
    const finalScore = playerScore * 100 - aiScore * 50;

    useEffect(() => {
        if (gameOver) {
            if (isHighScore(finalScore)) {
                setShowHighScoreDialog(true);
            }
        }
    }, [gameOver, finalScore, isHighScore]);
    
    const getGameOutcome = () => {
        if (!gameOver) return null;
        if (playerScore > aiScore) return 'win';
        if (aiScore > playerScore) return 'loss';
        return 'draw';
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl">
            <div className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-card/50 border border-border">
                <Button variant="ghost" asChild><Link href="/">&larr; Back to Menu</Link></Button>
                <h1 className="text-4xl font-bold text-primary">{GAME_NAME}</h1>
                <Button variant="outline" asChild><Link href={`/leaderboard/${GAME_ID}`}><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Link></Button>
            </div>

            <div className="w-full p-4 rounded-lg bg-card/50 border border-border flex justify-around text-2xl font-bold mb-8">
                <div>Player: <span className="text-primary">{playerScore}</span></div>
                <div>Round: <span className="text-accent">{rounds} / 5</span></div>
                <div>AI: <span className="text-destructive">{aiScore}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full items-center text-center">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-3xl font-bold">You</h2>
                    <div className="w-48 h-48 rounded-full bg-secondary flex items-center justify-center text-primary">
                        {playerChoice ? ICONS[playerChoice] : '?'}
                    </div>
                </div>
                 <div className="flex flex-col items-center gap-4">
                    <h2 className="text-3xl font-bold">AI</h2>
                    <div className="w-48 h-48 rounded-full bg-secondary flex items-center justify-center text-destructive">
                        {aiChoice ? ICONS[aiChoice] : '?'}
                    </div>
                </div>
            </div>

            {result && !gameOver && (
                <div className={cn("mt-8 text-4xl font-bold animate-pulse", 
                    result === 'win' && 'text-primary',
                    result === 'loss' && 'text-destructive',
                    result === 'draw' && 'text-accent'
                )}>
                    {result.toUpperCase()}
                </div>
            )}

            {gameOver ? (
                <div className="text-center flex flex-col items-center mt-8">
                     <h2 className="text-5xl font-bold text-primary mb-4">
                        { getGameOutcome() === 'win' && "You Win!" }
                        { getGameOutcome() === 'loss' && "You Lose!" }
                        { getGameOutcome() === 'draw' && "It's a Draw!" }
                    </h2>
                    <HighScoreDialog
                        open={showHighScoreDialog}
                        onOpenChange={setShowHighScoreDialog}
                        score={finalScore}
                        gameName={GAME_NAME}
                        onSave={(playerName) => addHighScore({ score: finalScore, playerName })}
                    />
                    <Button onClick={restartGame} size="lg">Play Again</Button>
                    <DifficultyAdjuster
                        gameName={GAME_NAME}
                        playerScore={finalScore}
                        currentDifficulty={difficulty}
                        onDifficultyChange={(newDifficulty) => setDifficulty(newDifficulty as Difficulty)}
                    />
                    <AiBanterBox gameName={GAME_NAME} gameOutcome={getGameOutcome()} score={finalScore} />
                </div>
            ) : (
                <div className="mt-8 flex gap-4">
                    {CHOICES.map(choice => (
                        <Button key={choice} onClick={() => handlePlayerChoice(choice)} size="lg" className="w-32 h-16 text-xl">
                            {ICONS[choice]} {choice.charAt(0).toUpperCase() + choice.slice(1)}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
