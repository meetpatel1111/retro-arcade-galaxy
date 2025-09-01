"use client"

import useLocalStorage from "@/hooks/useLocalStorage";
import type { HighScore } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "./ui/button";

const MOCK_SCORES: HighScore[] = [
    { game: 'Memory Match', playerName: 'Mem-Master', score: 150, date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { game: 'Memory Match', playerName: 'Player1', score: 120, date: new Date().toISOString() },
    { game: 'Quick Reaction', playerName: 'Speedy', score: 85, date: new Date(Date.now() - 86400000).toISOString() },
    { game: 'Puzzle', playerName: 'Puzzler', score: 200, date: new Date().toISOString() },
];

export default function LeaderboardClient() {
    const [highScores, setHighScores] = useLocalStorage<HighScore[]>('high-scores', MOCK_SCORES);

    const sortedScores = [...highScores].sort((a, b) => b.score - a.score);

    return (
        <div className="w-full max-w-4xl">
            <Button variant="ghost" asChild className="mb-4">
             <Link href="/">&larr; Back to Menu</Link>
            </Button>
            <Card className="border-accent/20 bg-background/50">
                <CardHeader>
                    <CardTitle className="text-4xl text-primary">Leaderboard</CardTitle>
                    <CardDescription>Top players across all games.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Rank</TableHead>
                                <TableHead>Player</TableHead>
                                <TableHead>Game</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedScores.length > 0 ? sortedScores.map((score, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium text-lg">{index + 1}</TableCell>
                                    <TableCell>{score.playerName}</TableCell>
                                    <TableCell>{score.game}</TableCell>
                                    <TableCell className="text-right font-bold text-accent text-lg">{score.score}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No scores yet. Be the first!</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
