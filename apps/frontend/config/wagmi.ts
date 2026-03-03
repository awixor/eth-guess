import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, foundry } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "EthGuess",
  projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect Project ID
  chains: [
    mainnet,
    sepolia,
    ...(process.env.NODE_ENV === "development" ? [foundry] : []),
  ],
  ssr: true,
});
