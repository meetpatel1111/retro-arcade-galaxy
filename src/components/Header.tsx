import Link from 'next/link';
import MusicToggle from './MusicToggle';
import { Gamepad2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg text-primary">Retro Arcade Galaxy</span>
        </Link>
        <MusicToggle />
      </div>
    </header>
  );
}
