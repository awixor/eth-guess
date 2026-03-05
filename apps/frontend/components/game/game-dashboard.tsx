"use client";

import { PriceTicker } from "@/components/game/price-ticker";
import { Leaderboard } from "@/components/game/leaderboard";
import { AuthGate } from "@/components/game/auth-gate";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { useCountdown } from "@/hooks/use-countdown";

export function GameDashboard() {
  const { price, round, myStats, isLoading, refetchRound } = useGame();
  const [prevPrice, setPrevPrice] = useState(price);
  const [syncedEndTimeMs, setSyncedEndTimeMs] = useState(0);

  const { timeLeft } = useCountdown(syncedEndTimeMs, () => {
    console.log("Timer complete: refetching round...");
    void refetchRound();
  });

  const isBettingDisabled = timeLeft <= 30;

  useEffect(() => {
    if (price !== prevPrice) {
      const timeout = setTimeout(() => setPrevPrice(price), 5000);
      return () => clearTimeout(timeout);
    }
  }, [price, prevPrice]);

  useEffect(() => {
    if (round && typeof round.remainingTime === "number") {
      const target = Date.now() + round.remainingTime * 1000;
      const timeoutId = setTimeout(() => setSyncedEndTimeMs(target), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [round?.remainingTime, round?.roundId, round]);

  if (isLoading && !round) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-start font-sans overflow-hidden w-full relative pt-8 pb-12">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="flex flex-col items-center w-full max-w-4xl px-4 md:px-6 z-10 relative gap-8 text-center pt-8">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-zinc-500 dark:text-zinc-400 font-bold tracking-[0.25em] uppercase text-xs md:text-sm">
            Live ETH/USD Round #{round?.roundId ?? "..."}
          </h2>
          <PriceTicker
            price={price}
            previousPrice={prevPrice}
            className="drop-shadow-sm text-5xl md:text-7xl"
          />
        </div>

        <AnimatePresence mode="wait">
          <AuthGate
            round={round}
            myStats={myStats}
            endTimeMs={syncedEndTimeMs}
            isBettingDisabled={isBettingDisabled}
          />
        </AnimatePresence>

        <Leaderboard />
      </div>
    </div>
  );
}
