"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTickerProps {
  price: number;
  previousPrice?: number;
  className?: string;
}

export function PriceTicker({
  price,
  previousPrice,
  className,
}: PriceTickerProps) {
  const direction =
    !previousPrice || price === previousPrice
      ? "neutral"
      : price > previousPrice
        ? "up"
        : "down";

  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-4xl md:text-6xl font-bold tracking-tighter",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={price}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-2 transition-colors duration-500",
            direction === "up"
              ? "text-up"
              : direction === "down"
                ? "text-down"
                : "text-foreground",
          )}
        >
          {direction === "up" && <TrendingUp className="h-8 w-8" />}
          {direction === "down" && <TrendingDown className="h-8 w-8" />}$
          {price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
