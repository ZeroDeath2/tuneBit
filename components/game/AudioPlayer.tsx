"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getRevealStages } from "@/lib/game/reveal-stages";

interface AudioPlayerProps {
  streamUrl: string | null;
  revealDuration: number;
  difficulty?: string;
  isComplete: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

type PlayerState = "idle" | "loading" | "ready" | "playing" | "paused" | "ended" | "error";

export function AudioPlayer({
  streamUrl,
  revealDuration,
  difficulty,
  isComplete,
  onPlayStart,
  onPlayEnd,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const stages = getRevealStages(difficulty);
  const finalStageDuration = stages[stages.length - 1] as number;
  const [audioDuration, setAudioDuration] = useState<number>(finalStageDuration);
  const START_OFFSET = 5;
  
  useEffect(() => {
    if (!isComplete) {
      setAudioDuration(finalStageDuration);
    }
  }, [finalStageDuration, isComplete]);
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const effectiveTargetDuration = isComplete ? audioDuration : finalStageDuration;
  const progressPercent = isComplete ? 100 : (revealDuration / finalStageDuration) * 100;
  const elapsedPercent = (progress / effectiveTargetDuration) * 100;

  const isLoading = playerState === "loading";
  const disabled = isLoading || playerState === "error" || !streamUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) {
      console.log("[AudioPlayer] Missing audio element or streamUrl:", streamUrl);
      return;
    }

    console.log("[AudioPlayer] Loading stream URL:", streamUrl);
    setPlayerState("loading");
    setError(null);
    setProgress(0);
    audio.src = streamUrl;
    audio.load();

    const onLoadedMetadata = () => {
      if (audio.duration && audio.duration !== Infinity) {
        setAudioDuration(audio.duration);
      }
    };
    const onCanPlay = () => {
      console.log("[AudioPlayer] canplay fired");
      setPlayerState((prev) => (prev === "loading" || prev === "idle" ? "ready" : prev));
    };
    const onPlaying = () => {
      console.log("[AudioPlayer] playing fired");
      setPlayerState("playing");
    };
    const onPauseEvent = () => {
      console.log("[AudioPlayer] pause fired");
      setPlayerState((prev) => (prev === "playing" ? "paused" : prev));
    };
    const onEnded = () => {
      console.log("[AudioPlayer] ended fired");
      setPlayerState("ended");
      setProgress(isComplete ? audioDuration : revealDuration);
      stopTrackingProgress();
    };
    const onError = (e: any) => {
      console.error("[AudioPlayer] Audio error event:", e, audio.error);
      setPlayerState("error");
      setError("Audio unavailable. Please try again.");
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPauseEvent);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPauseEvent);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [streamUrl, isComplete, audioDuration, revealDuration]);

  const stopTrackingProgress = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const trackProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isComplete && audio.currentTime >= START_OFFSET + revealDuration) {
      audio.pause();
      setProgress(revealDuration);
      setPlayerState("paused"); // changed from ended to paused because the song hasn't truly ended, just the reveal duration
      stopTrackingProgress();
      return;
    }

    setProgress(Math.max(0, audio.currentTime - START_OFFSET));
    animFrameRef.current = requestAnimationFrame(trackProgress);
  }, [revealDuration, stopTrackingProgress, isComplete]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || disabled) return;

    if (
      playerState === "ended" || 
      (!isComplete && audio.currentTime >= START_OFFSET + revealDuration) ||
      audio.currentTime < START_OFFSET
    ) {
      audio.currentTime = START_OFFSET;
    }

    setPlayerState("playing");

    try {
      await audio.play();
      animFrameRef.current = requestAnimationFrame(trackProgress);
    } catch (err) {
      console.error("[AudioPlayer] play() rejected:", err);
      setPlayerState("ready");
    }
  }, [disabled, trackProgress, playerState, isComplete, revealDuration]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    stopTrackingProgress();
    setPlayerState("paused");
  }, [stopTrackingProgress]);

  const handleButtonClick = useCallback(() => {
    if (playerState === "playing") {
      pause();
    } else {
      void play();
    }
  }, [playerState, play, pause]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === "Space" && !disabled) {
        e.preventDefault();
        handleButtonClick();
      }
    },
    [disabled, handleButtonClick]
  );

  const isButtonDisabled = disabled || playerState === "idle" || !streamUrl;

  const buttonLabel =
    playerState === "playing"
      ? "Pause audio"
      : playerState === "ended"
      ? "Play audio again"
      : "Play audio";

  const displaySeconds = isComplete
    ? `${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, "0")}`
    : revealDuration < 1
    ? `${Math.round(revealDuration * 1000)}ms`
    : `${revealDuration}s`;

  const ariaLabelText = isComplete
    ? `Audio progress: ${displaySeconds}`
    : `Audio revealed: ${displaySeconds} of ${finalStageDuration} seconds`;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" className="hidden" />

      {/* Play/Pause button */}
      <motion.button
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        disabled={isButtonDisabled}
        aria-label={buttonLabel}
        className={cn(
          "flex items-center justify-center w-24 h-24 rounded-full text-white transition-all shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          playerState === "playing"
            ? "bg-primary hover:bg-primary/90"
            : "bg-primary hover:bg-primary/90"
        )}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      >
        {isLoading ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : playerState === "playing" ? (
          <Pause className="w-10 h-10" aria-hidden />
        ) : playerState === "ended" ? (
          <RotateCcw className="w-9 h-9" aria-hidden />
        ) : (
          <Play className="w-10 h-10 ml-1" aria-hidden />
        )}
      </motion.button>

      {/* Progress bar */}
      <div className="w-full space-y-1.5 relative px-1 py-4">
        <div
          role="progressbar"
          aria-label={ariaLabelText}
          aria-valuenow={Math.round(progress * 10) / 10}
          aria-valuemin={0}
          aria-valuemax={effectiveTargetDuration}
          className="relative w-full h-3 bg-muted rounded-full overflow-hidden"
        >
          {/* Unlocked region */}
          <div
            className="absolute left-0 top-0 h-full bg-border rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Elapsed fill */}
          <motion.div
            className="absolute left-0 top-0 h-full bg-primary rounded-full"
            style={{ width: `${elapsedPercent}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { ease: "linear", duration: 0.05 }}
          />
        </div>
        
        {/* Markers */}
        {!isComplete && (
          <div className="absolute top-[1.1rem] left-1 right-1 h-3 pointer-events-none">
            {stages.map((stage, idx) => {
              if (stage === finalStageDuration) return null;
              const leftPercent = (stage / finalStageDuration) * 100;
              return (
                <div key={idx} className="absolute top-0 bottom-0 border-l border-background/80 flex flex-col items-center justify-start z-10" style={{ left: `${leftPercent}%` }}>
                  <span className="text-xs font-medium text-muted-foreground mt-3.5 translate-x-[-50%] whitespace-nowrap bg-background px-1 rounded-sm">{stage}s</span>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-base text-muted-foreground mt-4 pt-2">
          {isComplete ? "Full song unlocked: " : "You have heard "}
          <span className="font-semibold text-foreground">{displaySeconds}</span>
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
