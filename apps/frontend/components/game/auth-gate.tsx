"use client";

import { CurrentRoundCard } from "@/components/game/current-round-card";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AuthGateProps {
  endTimeMs: number;
  onTimerComplete: () => void;
}

export function AuthGate({ endTimeMs, onTimerComplete }: AuthGateProps) {
  const { user, isLoading } = useAuth();

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
        className="w-full"
      >
        <CurrentRoundCard
          endTimeMs={endTimeMs}
          onTimerComplete={onTimerComplete}
          upPercentage={62}
          onBetUp={() => console.log("UP")}
          onBetDown={() => console.log("DOWN")}
        />
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
            onTimerComplete={() => {}}
            upPercentage={62}
            onBetUp={() => {}}
            onBetDown={() => {}}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/50 backdrop-blur-[2px]">
          <SignInButton />
        </div>
      </div>
    </motion.div>
  );
}
