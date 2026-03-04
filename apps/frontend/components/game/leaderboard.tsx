"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  address: string;
  winnings: string;
  roundsWon: number;
}

const TOP_PLAYERS: LeaderboardEntry[] = [
  { rank: 1, address: "0x71C...4921", winnings: "12.45", roundsWon: 84 },
  { rank: 2, address: "0x3A2...9103", winnings: "8.12", roundsWon: 52 },
  { rank: 3, address: "0xF9d...2284", winnings: "5.67", roundsWon: 41 },
  { rank: 4, address: "0x12b...8810", winnings: "3.22", roundsWon: 29 },
  { rank: 5, address: "0x88e...1102", winnings: "2.89", roundsWon: 18 },
];

export function Leaderboard() {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-16 text-left">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Predictors
        </h3>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Global Rankings
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {TOP_PLAYERS.map((player, i) => (
          <motion.div
            key={player.address}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
              i === 0
                ? "bg-yellow-500/5 border-yellow-500/20 shadow-lg shadow-yellow-500/5"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {player.rank === 1 && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
                {player.rank === 2 && (
                  <Medal className="w-5 h-5 text-zinc-400" />
                )}
                {player.rank === 3 && (
                  <Medal className="w-5 h-5 text-amber-700" />
                )}
                {player.rank > 3 && (
                  <span className="text-sm font-bold text-zinc-400">
                    {player.rank}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm font-bold tracking-tight">
                  {player.address}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                  {player.roundsWon} Rounds Won
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-blue-500">
                {player.winnings} ETH
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                Profit
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
