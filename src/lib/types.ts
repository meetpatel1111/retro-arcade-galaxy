export type Game = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

export type HighScore = {
  game: string;
  score: number;
  playerName: string;
  date: string;
};
