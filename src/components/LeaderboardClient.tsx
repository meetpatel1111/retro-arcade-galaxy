"use client"

import { useState, useEffect } from "react";
import type { HighScore, Game } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "./ui/button";
import { useHighScores } from "@/hooks/useHighScores";
import { Trophy } from "lucide-react";
import { Skeleton } from "./ui/skeleton";


interface LeaderboardClientProps {
    game: Game | { id: 'all'; name: 'All Games' };
}

export default function LeaderboardClient({ game }: LeaderboardClientProps) {
    const { highScores, allScores } = useHighScores();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const scoresToShow = game.id === 'all' ? allScores : highScores(game.id);

    return (
        <div className="w-full max-w-4xl">
            <Button variant="ghost" asChild className="mb-4">
             <Link href="/">&larr; Back to Menu</Link>
            </Button>
            <Card className="border-accent/20 bg-background/50">
                <CardHeader>
                    <CardTitle className="text-4xl text-primary flex items-center gap-4"><Trophy />{game.name} Leaderboard</CardTitle>
                    <CardDescription>Top players for {game.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Rank</TableHead>
                                <TableHead>Player</TableHead>
                                {game.id === 'all' && <TableHead>Game</TableHead>}
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!hasMounted ? (
                                 Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        {game.id === 'all' && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                    </TableRow>
                                 ))
                            ) : scoresToShow.length > 0 ? scoresToShow.map((score, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium text-lg">{index + 1}</TableCell>
                                    <TableCell>{score.playerName}</TableCell>
                                    {game.id === 'all' && <TableCell>{score.gameName}</TableCell>}
                                    <TableCell>{new Date(score.date).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-accent text-lg">{score.score}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={game.id === 'all' ? 5 : 4} className="text-center">No scores yet. Be the first!</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
