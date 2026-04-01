"use client";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useApp } from "./context/AppContext";
import TaskCard from "./components/TaskCard";
import WalletGate from "./components/WalletGate";

export default function Home() {
  const { tasks, theme, MODERATOR_ADDRESS } = useApp();
  const { address } = useAccount();

  const isMod = !!address && address.toLowerCase() === MODERATOR_ADDRESS.toLowerCase();
  const approvedTasks = tasks.filter((t) => t.approvedByModerator);

  return (
    <WalletGate>
      <div>
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className={`font-display text-4xl font-bold leading-tight mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Task Board
              </h1>
              <p className={`text-base font-light italic ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Complete tasks, get AI-verified, earn points.
              </p>
            </div>
            {isMod ? (
              <Link
                href="/moderator"
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition glow-violet"
              >
                🛡️ Mod Panel
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition glow-violet"
              >
                My Dashboard →
              </Link>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`mb-8 p-4 rounded-2xl border text-sm font-medium ${
          theme === "dark"
            ? "bg-amber-950/20 border-amber-700/30 text-amber-300"
            : "bg-amber-50 border-amber-200 text-amber-700"
        }`}>
          <span className="font-bold">⚠️ Disclaimer:</span>{" "}
          <span className="font-normal italic">Points are not incentivized and not tied to GenLayer portal points.</span>
        </div>

        {/* Task grid */}
        {approvedTasks.length === 0 ? (
          <div className={`text-center py-24 rounded-2xl border ${
            theme === "dark" ? "border-white/5 bg-white/[0.02]" : "border-gray-200 bg-white/60"
          }`}>
            <div className="text-5xl mb-4">📋</div>
            <p className={`text-lg font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              No tasks available yet
            </p>
            <p className={`text-sm italic ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              The moderator hasn&apos;t published any tasks yet. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              {approvedTasks.length} Active Task{approvedTasks.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {approvedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </>
        )}
      </div>
    </WalletGate>
  );
}
