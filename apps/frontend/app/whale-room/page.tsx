"use client";

import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { ROUTES, QUERY_KEYS } from "@/lib/routes";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function WhaleRoomPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const {
    data,
    isLoading: isDataLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.game.whaleRoom,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}${ROUTES.game.whaleRoom}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to enter Whale Room");
      }
      return res.json();
    },
    enabled: !!user,
    retry: false,
  });

  if (isAuthLoading || (user && isDataLoading)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-zinc-500 font-medium">Verifying whale status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AccessDenied
        reason="Authentication Required"
        detail="Please sign in with your wallet to enter."
      />
    );
  }

  if (error) {
    return <AccessDenied reason="Access Denied" detail={error.message} />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex flex-col gap-8"
      >
        <header className="flex flex-col gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Game
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Whale Room</h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                Exclusive insights for high-balance traders.
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Market Sentiment</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Whale Longs</span>
                <span className="text-up font-bold">78%</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-up w-[78%]" />
                <div className="h-full bg-down w-[22%]" />
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Based on orders {">"} 1 Eth in the last 24 hours.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Status</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Your Balance</span>
                <span className="text-sm font-mono font-bold text-blue-500">
                  {data?.balance} Eth
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Verification</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold uppercase">
                  Passed
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-4 italic">
                &quot;{data?.message}&quot;
              </p>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

function AccessDenied({ reason, detail }: { reason: string; detail: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-2xl flex flex-col items-center text-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
          <Lock className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{reason}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
            {detail}
          </p>
        </div>
        <Link
          href="/"
          className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold hover:opacity-90 transition-opacity"
        >
          Return to Deck
        </Link>
      </motion.div>
    </div>
  );
}
