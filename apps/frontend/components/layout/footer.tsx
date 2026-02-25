import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full relative mt-auto border-t border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md">
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-blue-600/5 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
          © {new Date().getFullYear()} EthGuess. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <Link
            href="#"
            className="hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
