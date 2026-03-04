import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, foundry } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "EthGuess",
  projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect Project ID
  chains: [foundry, mainnet, sepolia],
  ssr: true,
});
