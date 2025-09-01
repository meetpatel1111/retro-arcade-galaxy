"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Puzzle as PuzzleIcon } from "lucide-react";

export default function Puzzle() {
  return (
    <Card className="w-full max-w-md text-center border-accent/20 bg-background/50">
      <CardHeader>
        <div className="flex justify-center mb-4">
            <PuzzleIcon className="w-16 h-16 text-primary" />
        </div>
        <CardTitle className="text-4xl">Sliding Puzzle</CardTitle>
        <CardDescription>Coming Soon!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-6">This game is under construction. Check back later to solve some puzzles!</p>
        <Button asChild>
          <Link href="/">Back to Main Menu</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
