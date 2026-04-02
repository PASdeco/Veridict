"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useApp } from "../context/AppContext";
import WalletGate from "../components/WalletGate";
import { Submission, Task } from "../types";

type Tab = "active" | "submitted" | "completed";

export default function DashboardPage() {
  const { tasks, isLoadingTasks, getTaskSubmissions, userPoints, refreshPoints, theme, MODERATOR_ADDRESS } = useApp();
  const { address } = useAccount();
  const [tab, setTab] = useState<Tab>("active");
  const [mySubmissions, setMySubmissions] = useState<{ task: Task; submission: Submission }[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);

  const wallet = address?.toLowerCase() ?? "";

  useEffect(() => {
    if (address) {
      refreshPoints(address);
      loadMySubmissions();
    }
  }, [address, tasks]);

  async function loadMySubmissions() {
    if (!address) return;
    setIsLoadingSubs(true);
    const all: { task: Task; submission: Submission }[] = [];
    for (const task of tasks) {
      const subs = await getTaskSubmissions(task.id);
      for (const sub of subs) {
        if (sub.submitted_by.toLowerCase() === wallet) {
          all.push({ task, submission: sub });
        }
      }
    }
    setMySubmissions(all);
    setIsLoadingSubs(false);
  }

  const activeTasks = tasks.filter((t) => t.creator.toLowerCase() !== wallet);
  const completedSubmissions = mySubmissions.filter((ms) => ms.submission.ai_verdict === "Approved");
  const points = address ? (userPoints[address] ?? 0) : 0;

  const cardClass = `rounded-xl border p-5 ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`;
  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition ${tab === t ? "bg-violet-600 text-white" : theme === "dark" ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`;

  const verdictBadge = (verdict: string) => {
    if (verdict === "Approved") return "text-green-400 bg-green-900/30";
    if (verdict === "Rejected") return "text-red-400 bg-red-900/30";
    return "text-yellow-400 bg-yellow-900/30";
  };

  return (
    <WalletGate>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className={`font-display text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>My Dashboard</h1>
          <p className={`text-sm mt-1 font-mono ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Points", value: points, color: "text-violet-400" },
            { label: "Available Tasks", value: activeTasks.length, color: "text-blue-400" },
            { label: "My Submissions", value: mySubmissions.length, color: "text-yellow-400" },
            { label: "Completed", value: completedSubmissions.length, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className={`${cardClass} text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className={`mb-6 p-3 rounded-xl border text-xs ${theme === "dark" ? "bg-yellow-950/20 border-yellow-800/40 text-yellow-300" : "bg-yellow-50 border-yellow-200 text-yellow-700"}`}>
          ⚠️ Points are not incentivized and not tied to GenLayer portal points.
        </div>

        <div className={`flex gap-2 mb-6 p-1 rounded-xl w-fit ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
          <button className={tabClass("active")} onClick={() => setTab("active")}>Active Tasks ({activeTasks.length})</button>
          <button className={tabClass("submitted")} onClick={() => setTab("submitted")}>My Submissions ({mySubmissions.length})</button>
          <button className={tabClass("completed")} onClick={() => setTab("completed")}>Completed ({completedSubmissions.length})</button>
        </div>

        {tab === "active" && (
          <div>
            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Tasks available to complete. Points earned = your AI score (0–100).
            </p>
            {isLoadingTasks ? (
              <p className={`text-sm italic text-center py-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Loading from GenLayer...</p>
            ) : activeTasks.length === 0 ? (
              <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                <div className="text-3xl mb-2">📭</div>
                <p className="font-medium">No active tasks available</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {activeTasks.map((task) => (
                  <Link href={`/task/${task.id}`} key={task.id}>
                    <div className={`${cardClass} hover:scale-[1.01] transition cursor-pointer ${theme === "dark" ? "hover:border-violet-700" : "hover:border-violet-400"}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{task.title}</h3>
                        <span className="shrink-0 text-xs font-bold text-violet-400 bg-violet-900/30 px-2 py-0.5 rounded-lg">≤ {task.reward_points} pts</span>
                      </div>
                      <p className={`text-xs line-clamp-2 mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{task.submission_count} submissions</span>
                        <span className="text-xs font-semibold text-violet-400">Submit →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "submitted" && (
          <div>
            {isLoadingSubs ? (
              <p className={`text-sm italic text-center py-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Loading from GenLayer...</p>
            ) : mySubmissions.length === 0 ? (
              <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                <div className="text-3xl mb-2">📝</div>
                <p className="font-medium">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySubmissions.map(({ task, submission: sub }) => (
                  <Link href={`/task/${task.id}`} key={sub.id}>
                    <div className={`${cardClass} hover:scale-[1.005] transition cursor-pointer ${theme === "dark" ? "hover:border-violet-700" : "hover:border-violet-400"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{task.title}</h3>
                          <a href={sub.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-violet-400 hover:underline text-xs mt-0.5 block truncate">{sub.link}</a>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${verdictBadge(sub.ai_verdict)}`}>{sub.ai_verdict}</span>
                          <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Score: {sub.ai_score}/100</span>
                          <span className="text-xs font-bold text-violet-400">{sub.points_awarded} pts</span>
                        </div>
                      </div>
                      {sub.disputed === "true" && (
                        <div className="mt-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub.dispute_resolved === "true" ? "text-violet-400 bg-violet-900/30" : "text-orange-400 bg-orange-900/30"}`}>
                            {sub.dispute_resolved === "true" ? "⚖️ Dispute resolved" : `⚖️ Disputed — ${sub.votes_agree} agree / ${sub.votes_disagree} disagree`}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "completed" && (
          <div>
            {completedSubmissions.length === 0 ? (
              <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-medium">No completed tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedSubmissions.map(({ task, submission: sub }) => (
                  <Link href={`/task/${task.id}`} key={sub.id}>
                    <div className={`${cardClass} hover:scale-[1.005] transition cursor-pointer`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{task.title}</h3>
                          <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                            AI Score: {sub.ai_score}/100{sub.dispute_resolved === "true" ? " · Community verified" : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-green-400 font-bold text-sm">+{sub.points_awarded} pts</p>
                          <p className="text-xs text-green-500">✅ Approved</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className={`${cardClass} flex items-center justify-between`}>
                  <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Total Earned</span>
                  <span className="text-violet-400 font-bold text-lg">{points} pts</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </WalletGate>
  );
}
