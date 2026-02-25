"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";

interface RoundTimerProps {
  endTimeMs: number;
  onComplete?: () => void;
  className?: string;
}

export function RoundTimer({
  endTimeMs,
  onComplete,
  className,
}: RoundTimerProps) {
  const { timeLeft, progress } = useCountdown(endTimeMs, onComplete);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative h-20 w-20 flex items-center justify-center">
        {/* Progress Circle Background */}
        <svg className="absolute h-full w-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="226.2"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 226.2 - (226.2 * progress) / 100 }}
            transition={{ duration: 1, ease: "linear" }}
            className="text-blue-500"
          />
        </svg>
        <span className="text-2xl font-bold font-mono">{timeLeft}s</span>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-xs font-semibold tracking-widest text-zinc-500 uppercase"
      >
        Time Remaining
      </motion.p>
    </div>
  );
}
