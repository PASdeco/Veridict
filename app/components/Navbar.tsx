"use client";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { theme, toggleTheme, userPoints, MODERATOR_ADDRESS } = useApp();
  const { address } = useAccount();

  const isMod = !!address && address.toLowerCase() === MODERATOR_ADDRESS.toLowerCase();

  return (
    <nav className={`sticky top-0 z-50 navbar-blur border-b ${
      theme === "dark"
        ? "bg-[#080b14]/80 border-violet-900/30"
        : "bg-white/80 border-violet-200/50"
    } px-6 py-3.5`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Veridict logo"
            width={36}
            height={36}
            className="rounded-lg object-contain"
          />
          <span className={`font-display text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Veri
          </span>
          <span className="font-display text-2xl font-bold text-gradient -ml-2">dict</span>
        </Link>

        <div className="flex items-center gap-2">
          {isMod ? (
            <Link
              href="/moderator"
              className={`text-sm px-3.5 py-1.5 rounded-lg transition font-semibold ${
                theme === "dark"
                  ? "text-violet-300 hover:text-white hover:bg-violet-900/40 border border-violet-800/40"
                  : "text-violet-700 hover:text-violet-900 hover:bg-violet-50 border border-violet-200"
              }`}
            >
              🛡️ Mod Panel
            </Link>
          ) : (
            address && (
              <Link
                href="/dashboard"
                className={`text-sm px-3.5 py-1.5 rounded-lg transition font-medium ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>
            )
          )}

          <Link
            href="/leaderboard"
            className={`text-sm px-3.5 py-1.5 rounded-lg transition font-medium ${
              theme === "dark"
                ? "text-gray-300 hover:text-white hover:bg-white/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Leaderboard
          </Link>

          <button
            onClick={toggleTheme}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition text-base ${
              theme === "dark"
                ? "bg-white/5 hover:bg-white/10 text-yellow-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {address && userPoints[address] !== undefined && userPoints[address] > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-600/90 text-white font-bold tracking-wide glow-violet">
              {userPoints[address]} pts
            </span>
          )}

          <ConnectButton
            label="Connect Wallet"
            accountStatus="address"
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </div>
    </nav>
  );
}
