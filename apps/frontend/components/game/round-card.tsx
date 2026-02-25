"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface RoundCardProps {
  title: string;
  timerText: ReactNode;
  upPercentage: number;
  className?: string;
  children?: ReactNode;
}

export function RoundCard({
  title,
  timerText,
  upPercentage,
  className,
  children,
}: RoundCardProps) {
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, upPercentage));

  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl shadow-inner",
        "border border-blue-500/30 dark:border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-zinc-500 dark:text-zinc-400 font-bold tracking-[0.2em] uppercase text-xs md:text-sm text-center">
          {title}
        </h3>
        <div className="text-2xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          {timerText}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center text-xs font-bold px-1">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-zinc-500 dark:text-zinc-400">UP</span>
            <span className="text-up text-sm">{clampedPercentage}%</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-zinc-500 dark:text-zinc-400">DOWN</span>
            <span className="text-down text-sm">
              {100 - clampedPercentage}%
            </span>
          </div>
        </div>
        <div className="h-2 w-full bg-down/30 rounded-full overflow-hidden shadow-inner flex">
          <div
            className="h-full bg-up shadow-[0_0_10px_var(--color-up)] transition-all duration-500 ease-in-out"
            style={{ width: `${clampedPercentage}%` }}
          />
          <div
            className="h-full bg-down shadow-[0_0_10px_var(--color-down)] transition-all duration-500 ease-in-out"
            style={{ width: `${100 - clampedPercentage}%` }}
          />
        </div>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center uppercase tracking-widest mt-1">
          Prediction Heat
        </span>
      </div>

      {children && (
        <div className="w-full mt-2 pt-4 border-t border-zinc-200/50 dark:border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}
