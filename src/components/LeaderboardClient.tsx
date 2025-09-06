"use client"

import { useState, useEffect } from "react";
import type { HighScore, Game } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "./ui/button";
import { useHighScores } from "@/hooks/useHighScores";
import { Film, Trophy } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import PlayerBackstory from "./PlayerBackstory";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";


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
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>Player</TableHead>
                                {game.id === 'all' && <TableHead>Game</TableHead>}
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                                <TableHead className="text-center">Legend</TableHead>
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
                                        <TableCell className="text-center"><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
                                    </TableRow>
                                 ))
                            ) : scoresToShow.length > 0 ? scoresToShow.map((score, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium text-lg">{index + 1}</TableCell>
                                    <TableCell className="flex items-center gap-4">
                                        <Avatar>
                                            {score.avatarDataUri ? (
                                                <AvatarImage src={score.avatarDataUri} alt={`${score.playerName}'s avatar`} />
                                            ) : null}
                                            <AvatarFallback>{score.playerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {score.playerName}
                                    </TableCell>
                                    {game.id === 'all' && <TableCell>{score.gameName}</TableCell>}
                                    <TableCell>{new Date(score.date).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-accent text-lg">{score.score}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <PlayerBackstory playerName={score.playerName} gameName={score.gameName} />
                                            {score.legendImageDataUri && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm"><Film className="mr-2 h-4 w-4" /> View</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-xl">
                                                        <DialogHeader>
                                                            <DialogTitle>The Legend of {score.playerName}</DialogTitle>
                                                            <DialogDescription>
                                                                An AI-generated image capturing the epic high score moment in {score.gameName}.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <Image src={score.legendImageDataUri} alt={`Legend of ${score.playerName}`} width={500} height={281} className="rounded-lg" />
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={game.id === 'all' ? 6 : 5} className="text-center">No scores yet. Be the first!</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
