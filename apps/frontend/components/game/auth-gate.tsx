"use client";

import { useAuth } from "@/context/auth-context";
import { useGame } from "@/hooks/use-game";
import { RoundResponse } from "@/lib/api";
import { UserStats } from "@/lib/game.types";
import { motion } from "framer-motion";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { CurrentRoundCard } from "@/components/game/current-round-card";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SessionKeyPanel } from "@/components/game/session-key-panel";

interface AuthGateProps {
  round?: RoundResponse;
  myStats?: UserStats;
  endTimeMs: number;
  isBettingDisabled: boolean;
}

export function AuthGate({
  round,
  myStats,
  endTimeMs,
  isBettingDisabled,
}: AuthGateProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { placeBet, isActionPending } = useGame();

  const total = parseFloat(round?.totalPool || "0");
  const up = parseFloat(round?.upPool || "0");
  const upPercentage = total > 0 ? Math.round((up / total) * 100) : 50;

  const handleBet = async (guessUp: boolean) => {
    try {
      await placeBet(guessUp, "0.01"); // Default bet for testing
    } catch (e) {
      console.error("Bet failed", e);
    }
  };

  const isLoading = isAuthLoading || isActionPending;

  if (isLoading) {
    return (
      <motion.div
        key="skeleton"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-lg h-48 rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-white/5 flex flex-col items-center justify-center gap-3 shadow-xl"
      >
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Checking wallet connection...
        </p>
      </motion.div>
    );
  }

  if (user) {
    return (
      <motion.div
        key="game"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-6 w-full"
      >
        <CurrentRoundCard
          endTimeMs={endTimeMs}
          upPercentage={upPercentage}
          onBetUp={() => handleBet(true)}
          onBetDown={() => handleBet(false)}
          isDisabled={isBettingDisabled}
        />

        <SessionKeyPanel />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
              Current Prediction
            </span>
            {myStats?.currentBet ? (
              <div className="flex items-center gap-2 text-sm font-semibold">
                {myStats.currentBet.guessedUp ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                )}
                <span>
                  {myStats.currentBet.amount} ETH on{" "}
                  {myStats.currentBet.guessedUp ? "UP" : "DOWN"}
                </span>
              </div>
            ) : (
              <span className="text-sm text-zinc-500 italic">
                No prediction yet
              </span>
            )}
          </div>

          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
              Previous Round
            </span>
            {myStats?.previousRound ? (
              <div className="flex items-center gap-2 text-sm font-semibold">
                {myStats.previousRound.won ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500">
                      Won {myStats.previousRound.payout} ETH
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-zinc-500">Lost</span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-sm text-zinc-500 italic">
                No history available
              </span>
            )}
          </div>
        </div>

        {isBettingDisabled && !myStats?.currentBet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest"
          >
            Betting window closed for this round
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      key="sign-in"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg"
    >
      <div className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="pointer-events-none select-none blur-sm opacity-40 p-4">
          <CurrentRoundCard
            endTimeMs={endTimeMs}
            upPercentage={upPercentage}
            onBetUp={() => {}}
            onBetDown={() => {}}
            isDisabled={true}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/50 backdrop-blur-[2px]">
          <SignInButton />
        </div>
      </div>
    </motion.div>
  );
}
