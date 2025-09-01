import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const Icon = game.icon;
  return (
    <Link href={game.href} className="group flex flex-col">
      <Card className="flex h-full flex-col overflow-hidden border-accent/20 bg-background/50 backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:shadow-accent/20 group-hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Icon className="h-12 w-12 text-primary" />
          <div>
            <CardTitle className="text-2xl">{game.name}</CardTitle>
            <CardDescription className="text-foreground/80">{game.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow"></CardContent>
        <div className="p-6 pt-0">
          <div className="flex w-full items-center justify-end text-sm font-bold text-primary transition-all group-hover:text-accent">
            Play Now <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
