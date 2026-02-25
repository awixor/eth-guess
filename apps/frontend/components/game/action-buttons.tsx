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
    <div className="flex flex-col gap-3 w-full mt-2">
      <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 px-2 uppercase tracking-widest">
        <span>Place Prediction</span>
        <span className="text-[10px] text-zinc-400 opacity-70">
          Current Round
        </span>
      </div>

      <div className="relative flex w-full p-1.5 bg-zinc-100/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-white/5 backdrop-blur-md shadow-inner gap-1.5">
        <PredictionButton type="up" onClick={onBetUp} disabled={disabled} />
        <PredictionButton type="down" onClick={onBetDown} disabled={disabled} />
      </div>

      <div className="flex justify-center mt-1">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-400 dark:text-zinc-600 uppercase">
          Whale Room Only
        </span>
      </div>
    </div>
  );
}

interface PredictionButtonProps {
  type: "up" | "down";
  onClick: () => void;
  disabled?: boolean;
}

const buttonConfig = {
  up: {
    label: "UP",
    Icon: ArrowBigUp,
    hoverBorder: "hover:border-up/30",
    gradientFrom: "from-up/5",
    iconBg: "bg-emerald-500/10",
    iconHoverBg: "group-hover:bg-emerald-500/20",
    iconColor: "text-emerald-500 fill-emerald-500/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  down: {
    label: "DOWN",
    Icon: ArrowBigDown,
    hoverBorder: "hover:border-down/30",
    gradientFrom: "from-down/5",
    iconBg: "bg-rose-500/10",
    iconHoverBg: "group-hover:bg-rose-500/20",
    iconColor: "text-rose-500 fill-rose-500/20",
    textColor: "text-rose-600 dark:text-rose-400",
  },
};

function PredictionButton({ type, onClick, disabled }: PredictionButtonProps) {
  const {
    label,
    Icon,
    hoverBorder,
    gradientFrom,
    iconBg,
    iconHoverBg,
    iconColor,
    textColor,
  } = buttonConfig[type];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex-1 flex flex-row items-center justify-center py-4 px-2 overflow-hidden rounded-xl bg-white dark:bg-zinc-800/80 border border-transparent transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        hoverBorder,
      )}
    >
      {/* Internal Subtle Glow */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-b to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          gradientFrom,
        )}
      />

      <div className="relative z-10 flex items-center gap-2">
        <div
          className={cn(
            "p-1.5 rounded-full transition-colors",
            iconBg,
            iconHoverBg,
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <span className={cn("text-lg font-bold tracking-wider", textColor)}>
          {label}
        </span>
      </div>
    </motion.button>
  );
}
