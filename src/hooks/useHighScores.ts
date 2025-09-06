"use client";
import type { HighScore } from '@/lib/types';
import useLocalStorage from './useLocalStorage';

const MAX_SCORES_PER_GAME = 10;

export function useHighScores(gameId?: string) {
  const [allScores, setAllScores] = useLocalStorage<HighScore[]>('high-scores', []);

  const highScores = (id: string) => {
    return allScores
      .filter(score => score.gameId === id)
      .sort((a, b) => b.score - a.score);
  };
  
  const sortedAllScores = [...allScores].sort((a, b) => b.score - a.score);

  const isHighScore = (score: number) => {
      if (!gameId) return false;
      if (score <= 0) return false;
      const gameScores = highScores(gameId);
      return gameScores.length < MAX_SCORES_PER_GAME || score > gameScores[gameScores.length - 1].score;
  }

  const addHighScore = (newScore: Omit<HighScore, 'gameId' | 'gameName' | 'date'>) => {
    if (!gameId) return;

    if (isHighScore(newScore.score)) {
        const newHighScore: HighScore = {
            ...newScore,
            gameId,
            gameName: gameId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            date: new Date().toISOString(),
        };

        const otherScores = allScores.filter(score => score.gameId !== gameId);
        const gameScores = highScores(gameId);

        const updatedGameScores = [...gameScores, newHighScore]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SCORES_PER_GAME);
        
        setAllScores([...otherScores, ...updatedGameScores]);
    }
  };
  
  const updateHighScore = (updatedScore: HighScore) => {
    setAllScores(prevScores => {
        return prevScores.map(score => 
            score.date === updatedScore.date && score.playerName === updatedScore.playerName
            ? updatedScore
            : score
        );
    });
  }

  return { highScores, allScores: sortedAllScores, isHighScore, addHighScore, updateHighScore };
}
