import Header from '@/components/Header';
import LeaderboardClient from '@/components/LeaderboardClient';
import { GAMES } from '@/lib/games';
import { notFound } from 'next/navigation';

export default function LeaderboardPage({ params }: { params: { gameId: string } }) {
  const game = GAMES.find((g) => g.id === params.gameId);

  if (!game && params.gameId !== 'all') {
    notFound();
  }

  const gameData = game ? { id: game.id, name: game.name } : { id: 'all', name: 'All Games' };

  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12">
        <LeaderboardClient game={gameData} />
      </main>
    </>
  );
}
