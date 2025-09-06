import SimonSays from '@/components/games/SimonSays';
import Header from '@/components/Header';

export default function SimonSaysPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-4">
        <SimonSays />
      </main>
    </>
  );
}
