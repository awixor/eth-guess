"use client";

import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "@/providers/theme-toggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full relative z-50 border-b border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md">
      <nav className="w-full flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]"
          >
            <div className="h-6 w-6 bg-white rounded-sm transform skew-x-12" />
          </motion.div>
          <span className="text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-white">
            ETHGUESS
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ConnectButton />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
