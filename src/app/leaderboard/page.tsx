import LeaderboardClient from '@/components/LeaderboardClient';
import Header from '@/components/Header';

export default function LeaderboardPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12">
        <LeaderboardClient />
      </main>
    </>
  );
}
