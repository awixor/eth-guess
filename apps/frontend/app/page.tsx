export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
          EthGuess
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          The ultimate price-prediction dApp. Connect your wallet and start
          playing.
        </p>
      </main>
    </div>
  );
}
