import type { Game } from '@/lib/types';
import { BrainCircuit, Puzzle, Zap, GitCommitHorizontal, Hammer, X, Rows4, MoveHorizontal, Bomb } from 'lucide-react';

export const GAMES: Game[] = [
  {
    id: 'quick-reaction',
    name: 'Quick Reaction',
    description: 'How fast are your reflexes? Click when ready!',
    icon: Zap,
    href: '/games/quick-reaction',
  },
  {
    id: 'puzzle',
    name: 'Sliding Puzzle',
    description: 'Slide the tiles to solve the puzzle.',
    icon: Puzzle,
    href: '/games/puzzle',
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Guide the snake to eat the food and grow.',
    icon: GitCommitHorizontal,
    href: '/games/snake',
  },
  {
    id: 'whack-a-mole',
    name: 'Whack-a-Mole',
    description: 'Test your reflexes and whack the moles!',
    icon: Hammer,
    href: '/games/whack-a-mole',
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'The classic game of Xs and Os.',
    icon: X,
    href: '/games/tic-tac-toe',
  },
  {
    id: 'connect-four',
    name: 'Connect Four',
    description: 'Get four of your discs in a row to win.',
    icon: Rows4,
    href: '/games/connect-four',
  },
  {
    id: 'pong',
    name: 'Pong',
    description: 'The original paddle and ball game.',
    icon: MoveHorizontal,
    href: '/games/pong',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Clear the board without hitting a mine.',
    icon: Bomb,
    href: '/games/minesweeper',
  },
];
