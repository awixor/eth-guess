import { ThemeToggle } from "@/providers/theme-toggle";
import { TrendingUp } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black transition-colors">
      <nav className="absolute top-4 right-4 flex items-center gap-4">
        <ConnectButton />
        <ThemeToggle />
      </nav>
      <main className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">
        <div className="flex items-center gap-4">
          <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            EthGuess
          </h1>
        </div>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          The ultimate price-prediction dApp. Connect your wallet and start
          playing.
        </p>
      </main>
    </div>
  );
}
