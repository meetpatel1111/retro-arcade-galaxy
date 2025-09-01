import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const Icon = game.icon;
  return (
    <Card className="flex flex-col overflow-hidden border-accent/20 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center gap-4">
        <Icon className="h-12 w-12 text-primary" />
        <div>
          <CardTitle className="text-2xl">{game.name}</CardTitle>
          <CardDescription className="text-foreground/80">{game.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <div className="p-6 pt-0">
        <Button asChild className="w-full bg-primary/80 text-primary-foreground hover:bg-primary">
          <Link href={game.href}>
            Play Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
