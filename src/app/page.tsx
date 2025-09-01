import { BrainCircuit, Puzzle, Zap, GitCommitHorizontal, Hammer } from 'lucide-react';
import GameCard from '@/components/GameCard';
import type { Game } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MinigameSuggester from '@/components/MinigameSuggester';

const games: Game[] = [
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Test your memory and find all the pairs.',
    icon: BrainCircuit,
    href: '/games/memory-match',
  },
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
  }
];

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-primary animate-neon-glow">
              Retro Arcade Galaxy
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-foreground/80 md:text-xl">
              Your portal to classic arcade fun. Dive into our collection of minigames!
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="outline">
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
            <MinigameSuggester />
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Retro Arcade Galaxy. All rights reserved.
      </footer>
    </div>
  );
}
