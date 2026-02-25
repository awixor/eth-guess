"use client";

import { PriceTicker } from "@/components/game/price-ticker";
import { ActionButtons } from "@/components/game/action-buttons";
import { RoundTimer } from "@/components/game/round-timer";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
    <div className="flex flex-1 flex-col items-center justify-center font-sans overflow-hidden w-full relative py-12">
      {/* Animated Subtle Background Grid - Style Enhancement */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="flex flex-col items-center justify-center w-full max-w-5xl px-6 z-10 relative">
        {/* Main Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full glass rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center gap-12 shadow-2xl shadow-blue-900/10 dark:shadow-blue-900/20"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1/2 bg-blue-500/15 blur-[120px] pointer-events-none rounded-full" />

          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-zinc-500 dark:text-zinc-400 font-bold tracking-[0.25em] uppercase text-xs md:text-sm">
              Live ETH/USD Round
            </h2>
            <PriceTicker
              price={price}
              previousPrice={prevPrice}
              className="drop-shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 md:gap-12 bg-white/40 dark:bg-black/40 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-inner">
            <div className="flex flex-col gap-2 order-2 md:order-1 items-center md:items-start w-full md:w-1/3">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider">
                Next Round
              </span>
              <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-zinc-800 dark:text-zinc-100">
                00:45
              </span>
            </div>

            <div className="order-1 md:order-2 flex justify-center w-full md:w-1/3">
              <RoundTimer
                endTimeMs={endTimeMs}
                onComplete={() => setEndTimeMs(Date.now() + 60000)}
              />
            </div>

            <div className="flex flex-col gap-2 order-3 items-center md:items-end w-full md:w-1/3">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider">
                Sentiment
              </span>
              <div className="flex flex-col items-end gap-1 w-full max-w-30">
                <span className="text-up font-black text-xl">64% UP</span>
                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-up w-[64%] shadow-[0_0_10px_var(--color-up)]" />
                </div>
              </div>
            </div>
          </div>

          <ActionButtons
            onBetUp={() => console.log("UP")}
            onBetDown={() => console.log("DOWN")}
          />

          <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base text-center max-w-md leading-relaxed font-medium">
            Predict the movement for the next 60 seconds.{" "}
            <br className="hidden md:block" />
            Connect your wallet to start placing real-time predictions.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
