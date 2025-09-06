
"use client";
import type { HighScore } from '@/lib/types';
import useLocalStorage from './useLocalStorage';

const MAX_SCORES_PER_GAME = 10;
const MAX_TOTAL_LEGEND_IMAGES = 5; // Keep only the most recent legend images

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
        let scoresWithImages = prevScores.filter(s => s.legendImageDataUri);
        
        // Add the new score temporarily to check if we need to prune
        const potentialNewScores = prevScores.map(score => 
            score.date === updatedScore.date && score.playerName === updatedScore.playerName
            ? updatedScore
            : score
        );

        // If we have a new image and we're over the limit, prune the oldest one
        if (updatedScore.legendImageDataUri && scoresWithImages.length >= MAX_TOTAL_LEGEND_IMAGES) {
            scoresWithImages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const oldestImageScore = scoresWithImages[MAX_TOTAL_LEGEND_IMAGES - 1];
            
            // Find the score to prune in the new list and remove its image data
            for (let i = 0; i < potentialNewScores.length; i++) {
                if (potentialNewScores[i].date === oldestImageScore.date) {
                    delete potentialNewScores[i].legendImageDataUri;
                    break;
                }
            }
        }
        
        return potentialNewScores;
    });
  }

  return { highScores, allScores: sortedAllScores, isHighScore, addHighScore, updateHighScore };
}
