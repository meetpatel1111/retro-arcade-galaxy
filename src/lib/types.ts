export type Game = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

export type HighScore = {
  gameId: string;
  gameName: string;
  score: number;
  playerName: string;
  date: string;
  avatarDataUri?: string;
  legendImageDataUri?: string;
};
