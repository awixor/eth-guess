"use client";

import { PriceTicker } from "@/components/game/price-ticker";
import { CurrentRoundCard } from "@/components/game/current-round-card";
import { LeaderboardPlaceholder } from "@/components/game/leaderboard-placeholder";
import { useState, useEffect } from "react";

export function GameDashboard() {
  const [price, setPrice] = useState(2842.45);
  const [prevPrice, setPrevPrice] = useState(2840.12);
  const [endTimeMs, setEndTimeMs] = useState(() => Date.now() + 60000);

  // Mock price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevPrice(price);
      setPrice((p) => p + (Math.random() * 10 - 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [price]);

  return (
    <div className="flex flex-1 flex-col items-center justify-start font-sans overflow-hidden w-full relative pt-8 pb-12">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="flex flex-col items-center w-full max-w-4xl px-4 md:px-6 z-10 relative gap-8 text-center pt-8">
        {/* Top Bar: Live Price Ticker */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-zinc-500 dark:text-zinc-400 font-bold tracking-[0.25em] uppercase text-xs md:text-sm">
            Live ETH/USD Round
          </h2>
          <PriceTicker
            price={price}
            previousPrice={prevPrice}
            className="drop-shadow-sm text-5xl md:text-7xl"
          />
        </div>

        {/* Middle: Current Round Card */}
        <CurrentRoundCard
          endTimeMs={endTimeMs}
          onTimerComplete={() => setEndTimeMs(Date.now() + 60000)}
          upPercentage={62}
          onBetUp={() => console.log("UP")}
          onBetDown={() => console.log("DOWN")}
        />

        {/* Bottom Placeholder: Leaderboard */}
        <LeaderboardPlaceholder />
      </div>
    </div>
  );
}
