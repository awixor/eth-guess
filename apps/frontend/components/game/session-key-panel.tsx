"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, AlertCircle, Loader2, X } from "lucide-react";
import { useSessionKey } from "@/context/session-key-context";
import { useState } from "react";

export function SessionKeyPanel() {
  const {
    isSessionActive,
    isCreatingSession,
    sessionError,
    enableSession,
    disableSession,
  } = useSessionKey();

  const [localError, setLocalError] = useState<string | null>(null);

  const handleEnable = async () => {
    setLocalError(null);
    try {
      await enableSession();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const displayError = sessionError ?? localError;

  return (
    <div className="w-full max-w-lg">
      <AnimatePresence mode="wait">
        {isSessionActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
                <ShieldCheck className="relative w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Gasless Betting Active
              </span>
              <span className="hidden sm:inline text-xs text-emerald-500/70 font-medium">
                · No popups
              </span>
            </div>

            <button
              onClick={disableSession}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Disable
            </button>
          </motion.div>
        ) : isCreatingSession ? (
          <motion.div
            key="creating"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
          >
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-blue-500">
              Approve in wallet…
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => void handleEnable()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white/80" />
              Enable Gasless Betting
            </motion.button>

            <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
              {displayError?.includes("Sepolia")
                ? "Switch to Sepolia to use this feature"
                : "Approve once — bet without wallet popups"}
            </p>

            {displayError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400"
              >
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p className="text-xs leading-snug">{displayError}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
