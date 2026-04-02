"use client";
import Link from "next/link";
import { Task } from "../types";
import { useApp } from "../context/AppContext";

export default function TaskCard({ task }: { task: Task }) {
  const { theme } = useApp();
  const subCount = parseInt(task.submission_count || "0");

  return (
    <Link href={`/task/${task.id}`}>
      <div className={`card-hover rounded-2xl border p-5 cursor-pointer ${
        theme === "dark"
          ? "glass-dark hover:border-violet-600/50 hover:shadow-[0_4px_24px_rgba(124,58,237,0.15)]"
          : "glass-light hover:border-violet-400/60 hover:shadow-[0_4px_24px_rgba(124,58,237,0.1)]"
      }`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className={`font-semibold text-base leading-snug ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {task.title}
          </h3>
          <span className="shrink-0 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
            ≤ {task.reward_points} pts
          </span>
        </div>

        <p className={`text-sm leading-relaxed line-clamp-2 mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          {task.description}
        </p>

        <div className={`h-px mb-4 ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`} />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              {task.creator.slice(0, 6)}...{task.creator.slice(-4)}
            </span>
            <span className={`text-xs ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`}>·</span>
            <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              {subCount} submission{subCount !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-xs font-semibold text-violet-400">View →</span>
        </div>
      </div>
    </Link>
  );
}
