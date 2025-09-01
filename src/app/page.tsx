import GameCard from '@/components/GameCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MinigameSuggester from '@/components/MinigameSuggester';
import { GAMES } from '@/lib/games';

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
            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="outline">
              <Link href="/leaderboard/all">View All Scores</Link>
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
