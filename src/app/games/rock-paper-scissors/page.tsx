import RockPaperScissors from '@/components/games/RockPaperScissors';
import Header from '@/components/Header';

export default function RockPaperScissorsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-4">
        <RockPaperScissors />
      </main>
    </>
  );
}
