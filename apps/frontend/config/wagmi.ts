import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "EthGuess",
  projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect Project ID
  chains: [mainnet, sepolia],
  ssr: true,
});
