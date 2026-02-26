"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Wallet } from "lucide-react";
import { useConnection } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface SignInButtonProps {
  className?: string;
}

export function SignInButton({ className }: SignInButtonProps) {
  const { isConnected } = useConnection();
  const { openConnectModal } = useConnectModal();
  const { signIn, isLoading } = useAuth();

  const pendingSignIn = useRef(false);

  useEffect(() => {
    if (isConnected && pendingSignIn.current) {
      pendingSignIn.current = false;
      void signIn().catch((err: unknown) => {
        console.error("Auto sign-in after connect failed:", err);
      });
    }
  }, [isConnected, signIn]);

  const handleClick = async () => {
    if (isLoading) return;

    if (!isConnected) {
      pendingSignIn.current = true;
      openConnectModal?.();
      return;
    }

    try {
      await signIn();
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center mb-2 ring-1 ring-blue-500/20">
          <Wallet className="w-7 h-7 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
          Sign In to Play
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
          {isLoading
            ? "Check your wallet for a signature request…"
            : "One click — connect your wallet and you're in."}
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => void handleClick()}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white",
          "bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.35)]",
          "transition-all disabled:opacity-60 disabled:cursor-not-allowed",
          className,
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Wallet className="w-5 h-5" />
        )}
        {isLoading ? "Waiting for signature…" : "Sign In with Ethereum"}
      </motion.button>
    </div>
  );
}
