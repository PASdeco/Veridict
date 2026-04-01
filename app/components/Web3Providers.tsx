"use client";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "../lib/wagmiConfig";
import { useApp } from "../context/AppContext";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export default function Web3Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme === "dark" ? darkTheme({ accentColor: "#7c3aed" }) : lightTheme({ accentColor: "#7c3aed" })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
