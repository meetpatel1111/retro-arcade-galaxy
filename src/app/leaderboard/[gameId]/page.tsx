import Header from '@/components/Header';
import LeaderboardClient from '@/components/LeaderboardClient';
import { GAMES } from '@/lib/games';
import { notFound } from 'next/navigation';

export default function LeaderboardPage({ params }: { params: { gameId: string } }) {
  const game = GAMES.find((g) => g.id === params.gameId);

  if (!game) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12">
        <LeaderboardClient game={game} />
      </main>
    </>
  );
}
