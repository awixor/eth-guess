"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/providers/theme-toggle";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { LogOut, Trophy } from "lucide-react";
import { ChainSwitcher } from "./chain-switcher";
import { useGame } from "@/hooks/use-game";

export function Header() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const { myStats, isLoading: isGameLoading } = useGame();
  const isLoading = isAuthLoading || isGameLoading;

  return (
    <header className="w-full relative z-50 border-b border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md">
      <nav className="w-full flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]"
          >
            <div className="h-6 w-6 bg-white rounded-sm transform skew-x-12" />
          </motion.div>
          <span className="text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-white">
            ETHGUESS
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <ChainSwitcher />

              <div className="flex items-center gap-2">
                {myStats?.previousRound?.won && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold font-mono">
                      +{myStats.previousRound.payout} ETH
                    </span>
                  </div>
                )}
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5">
                  {user.address.slice(0, 6)}…{user.address.slice(-4)}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => void signOut()}
                  disabled={isLoading}
                  title="Sign out"
                  className="p-1.5 rounded-lg cursor-pointer text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
