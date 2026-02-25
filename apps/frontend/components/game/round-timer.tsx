"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { ProgressCircle } from "@/components/ui/progress-circle";

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
        <ProgressCircle progress={progress} className="text-blue-500" />
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
