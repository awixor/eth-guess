"use client";

import { useChains, useConnection, useSwitchChain } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, Check } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

export function ChainSwitcher() {
  const chains = useChains();
  const { chain } = useConnection();
  const { mutate: switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all backdrop-blur-md",
          "bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 hover:border-blue-500/50",
          "text-zinc-700 dark:text-zinc-300",
        )}
      >
        <Globe className="w-3.5 h-3.5 text-blue-500" />
        <span className="max-w-20 truncate">
          {chain?.name ?? "Unsupported"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl z-60 overflow-hidden"
          >
            <div className="p-1.5 flex flex-col gap-1">
              {chains.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    switchChain({ chainId: item.id });
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                    item?.id === item.id
                      ? "bg-blue-500/10 text-blue-500"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  <span>{item.name}</span>
                  {item?.id === item.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
