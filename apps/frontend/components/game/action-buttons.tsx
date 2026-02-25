"use client";

import { motion } from "framer-motion";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  onBetUp: () => void;
  onBetDown: () => void;
  disabled?: boolean;
}

export function ActionButtons({
  onBetUp,
  onBetDown,
  disabled,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled}
        onClick={onBetUp}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300",
          "bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 font-bold text-xl",
          "hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:neon-up",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        )}
      >
        <ArrowBigUp className="h-10 w-10 mb-2 fill-emerald-400" />
        BULLISH
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled}
        onClick={onBetDown}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300",
          "bg-rose-500/10 border-2 border-rose-500/20 text-rose-400 font-bold text-xl",
          "hover:border-rose-500/50 hover:bg-rose-500/20 hover:neon-down",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        )}
      >
        <ArrowBigDown className="h-10 w-10 mb-2 fill-rose-400" />
        BEARISH
      </motion.button>
    </div>
  );
}
