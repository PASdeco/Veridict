import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  rabbyWallet,
  metaMaskWallet,
  zerionWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  trustWallet,
  phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Veridict",
  projectId: "b8a1daa2f2e3c4d5e6f7a8b9c0d1e2f3",
  chains: [mainnet, polygon, arbitrum, optimism, base],
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, rabbyWallet, zerionWallet, coinbaseWallet],
    },
    {
      groupName: "More",
      wallets: [rainbowWallet, walletConnectWallet, trustWallet, phantomWallet],
    },
  ],
  ssr: true,
});
