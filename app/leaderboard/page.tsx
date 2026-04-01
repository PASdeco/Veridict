"use client";
import { useAccount } from "wagmi";
import { useApp } from "../context/AppContext";
import WalletGate from "../components/WalletGate";

export default function LeaderboardPage() {
  const { userPoints, theme } = useApp();
  const { address } = useAccount();

  const sorted = Object.entries(userPoints)
    .sort(([, a], [, b]) => b - a)
    .filter(([, pts]) => pts > 0);

  const medals = ["🥇", "🥈", "🥉"];

  const cardClass = `rounded-2xl border p-5 ${theme === "dark" ? "glass-dark" : "glass-light shadow-sm"}`;

  return (
    <WalletGate>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className={`font-display text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Leaderboard
          </h1>
          <p className={`text-sm mt-1 italic font-light ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Top contributors ranked by earned points
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className={`text-center py-20 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-lg font-medium">No points earned yet</p>
            <p className="text-sm mt-1">Complete tasks and get AI approval to earn points.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(([addr, points], index) => {
              const isMe = addr.toLowerCase() === (address ?? "").toLowerCase();
              return (
                <div
                  key={addr}
                  className={`${cardClass} flex items-center gap-4 ${isMe ? "ring-2 ring-violet-500" : ""}`}
                >
                  <span className="text-2xl w-8 text-center">
                    {medals[index] ?? `#${index + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-sm font-semibold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {addr.slice(0, 6)}...{addr.slice(-4)}
                      {isMe && <span className="ml-2 text-xs italic text-violet-400">(you)</span>}
                    </p>
                  </div>
                  <span className="text-violet-400 font-bold text-sm shrink-0">
                    {points} pts
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WalletGate>
  );
}
