import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, foundry } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "EthGuess",
  projectId: "YOUR_PROJECT_ID",
  chains: [foundry, mainnet, sepolia],
  transports: {
    [foundry.id]: http("http://127.0.0.1:8545"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
