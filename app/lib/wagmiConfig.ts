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
import { defineChain } from "viem";

// GenLayer Studionet
export const genlayerStudionet = defineChain({
  id: 61999,
  name: "GenLayer Studionet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://studio.genlayer.com/api"] },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Studio",
      url: "https://studio.genlayer.com",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "Veridict",
  projectId: "b8a1daa2f2e3c4d5e6f7a8b9c0d1e2f3",
  chains: [genlayerStudionet],
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
