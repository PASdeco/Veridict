"use client";
import Image from "next/image";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useApp } from "../context/AppContext";

export default function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { theme } = useApp();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center px-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-3xl scale-150" />
          <Image
            src="/logo.png"
            alt="Veridict"
            width={72}
            height={72}
            className="relative rounded-2xl object-contain"
          />
        </div>

        <div>
          <h2 className={`font-display text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Connect Your Wallet
          </h2>
          <p className={`text-sm font-light italic max-w-xs leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            You need a connected wallet to view tasks, submit work, and earn points.
          </p>
        </div>

        <ConnectButton label="Connect Wallet" />
      </div>
    );
  }

  return <>{children}</>;
}
