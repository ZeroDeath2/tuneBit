"use client";

import { useState, useCallback } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { GuessInput } from "./GuessInput";
import { GuessHistory } from "./GuessHistory";
import { AttemptIndicator } from "./AttemptIndicator";
import { GameResult } from "./GameResult";
import { SkipForward } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import type { SongReveal } from "@/lib/game/types";

interface GameBoardProps {
  header?: React.ReactNode;
}

export function GameBoard({ header }: GameBoardProps = {}) {
  const { gameState, isLoading, isSubmitting, streamUrl, submitGuess, skip, startPracticeGame, advanceRound } =
    useGame();
  const [revealedSong, setRevealedSong] = useState<SongReveal | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleGuess = useCallback(
    async (songId: string, title: string, artist: string) => {
      setSubmitError(null);
      try {
        const result = await submitGuess(songId);
        if (result && "song" in result && result.song) {
          setRevealedSong(result.song as SongReveal);
        }
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to submit guess");
      }
    },
    [submitGuess]
  );

  const handleSkip = useCallback(async () => {
    setSubmitError(null);
    try {
      const result = await skip();
      if (result && "song" in result && result.song) {
        setRevealedSong(result.song as SongReveal);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to skip");
    }
  }, [skip]);

  const handlePlayAgain = useCallback(async () => {
    setRevealedSong(null);
    setSubmitError(null);
    await startPracticeGame(gameState?.category ?? "all");
  }, [startPracticeGame, gameState?.category]);

  const handleNextRound = useCallback(async () => {
    setRevealedSong(null);
    setSubmitError(null);
    await advanceRound();
  }, [advanceRound]);

  if (!gameState) return null;

  const isComplete = gameState.status !== "playing";
  const isDaily = gameState.mode === "daily";
  const isFinalRound = gameState.roundNumber === 3;

  return (
    <div className="w-full mx-auto flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
      {/* Game Section (Left 2/3) */}
      <div className="w-full md:w-2/3 space-y-8">
        {isDaily && (
          <div className="flex justify-between items-center text-sm text-muted-foreground border-b pb-2">
            <span>Round {gameState.roundNumber} / 3</span>
            <span>Total Score: {gameState.totalScore}</span>
          </div>
        )}
        
        {header}
        
        {/* Audio Player */}
        <AudioPlayer
          streamUrl={streamUrl}
          revealDuration={gameState.revealDuration ?? 0.2}
          difficulty={gameState.difficulty}
          isComplete={isComplete}
        />

        {/* Last wrong guess notification */}
        {gameState.guesses &&
          gameState.guesses.length > 0 &&
          gameState.guesses[gameState.guesses.length - 1] &&
          !gameState.guesses[gameState.guesses.length - 1]!.correct &&
          gameState.guesses[gameState.guesses.length - 1]!.type === "guess" && (
            <div className="bg-incorrect/10 text-incorrect text-center py-2 px-4 rounded-lg font-medium text-sm animate-in fade-in slide-in-from-top-2 duration-300 -mt-4">
              ❌ Oops! Wrong guess
            </div>
          )}

        {/* Attempt indicator */}
        <AttemptIndicator
          attemptsUsed={gameState.attemptsUsed}
          guesses={gameState.guesses || []}
        />

        {/* Game complete: show result */}
        {isComplete ? (
          <GameResult
            gameState={gameState}
            song={revealedSong}
            onPlayAgain={!isDaily ? handlePlayAgain : undefined}
            onNextRound={isDaily && !isFinalRound ? handleNextRound : undefined}
          />
        ) : (
          <>
            {/* Guess input */}
            <GuessInput
              onSubmit={handleGuess}
              onSkip={handleSkip}
              disabled={isSubmitting}
              isSubmitting={isSubmitting}
              language={gameState.language}
            />

            {submitError && (
              <p role="alert" className="text-destructive text-sm text-center">
                {submitError}
              </p>
            )}
          </>
        )}
      </div>

      {/* History Section (Right 1/3) */}
      <div className="w-full md:w-1/3 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Attempt History</h3>
        <GuessHistory guesses={gameState.guesses || []} />
      </div>
    </div>
  );
}
