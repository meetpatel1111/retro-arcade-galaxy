import MemoryMatch from '@/components/games/MemoryMatch';
import Header from '@/components/Header';

export default function MemoryMatchPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-4">
        <MemoryMatch />
      </main>
    </>
  );
}
