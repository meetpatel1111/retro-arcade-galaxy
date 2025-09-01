import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const Icon = game.icon;
  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden border-accent/20 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1">
      <div>
        <CardHeader className="flex flex-row items-center gap-4">
          <Icon className="h-12 w-12 text-primary" />
          <div>
            <CardTitle className="text-2xl">{game.name}</CardTitle>
            <CardDescription className="text-foreground/80">{game.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow"></CardContent>
      </div>
      <div className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={game.href}>
            Play Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
