"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import WalletGate from "../components/WalletGate";

type Tab = "pending" | "approved" | "create";

export default function ModeratorPage() {
  const { tasks, approveTask, deleteTask, createTask, theme, MODERATOR_ADDRESS } = useApp();
  const { address } = useAccount();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");

  // Create task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState(100);
  const [createSuccess, setCreateSuccess] = useState(false);

  const isMod = !!address && address.toLowerCase() === MODERATOR_ADDRESS.toLowerCase();

  const pendingTasks = tasks.filter((t) => !t.approvedByModerator);
  const approvedTasks = tasks.filter((t) => t.approvedByModerator);

  const cardClass = `rounded-2xl border p-5 ${theme === "dark" ? "glass-dark" : "glass-light shadow-sm"}`;
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-violet-500 ${theme === "dark" ? "bg-white/5 border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`;
  const labelClass = `block text-sm font-medium mb-1.5 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`;

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    // Moderator-created tasks are auto-approved
    createTask(address ?? null, title.trim(), description.trim(), rewardPoints, true);
    setTitle("");
    setDescription("");
    setRewardPoints(100);
    setCreateSuccess(true);
    setTimeout(() => setCreateSuccess(false), 3000);
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition ${
      tab === t
        ? "bg-violet-600 text-white"
        : theme === "dark"
        ? "text-gray-400 hover:text-white hover:bg-gray-800"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    }`;

  function TaskRow({ task, showApprove }: { task: (typeof tasks)[0]; showApprove: boolean }) {
    return (
      <div className={`${cardClass} mb-3`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {task.title}
            </h3>
            <p className={`text-sm mt-1 line-clamp-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {task.description}
            </p>
            <div className={`flex gap-3 mt-2 text-xs flex-wrap ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              <span>Creator: {task.creator.slice(0, 6)}...{task.creator.slice(-4)}</span>
              <span>up to {task.rewardPoints} pts</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              <span>{task.submissions.length} submission{task.submissions.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {showApprove ? (
              <>
                <button
                  onClick={() => approveTask(task.id)}
                  className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
                >
                  ✕ Reject
                </button>
              </>
            ) : (
              <button
                onClick={() => deleteTask(task.id)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Block non-moderators entirely
  if (!isMod) {
    return (
      <WalletGate>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="text-5xl">🚫</div>
          <div>
            <h2 className={`font-display text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Access Denied
            </h2>
            <p className={`text-sm italic font-light max-w-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              This panel is restricted to the moderator only. Connect with the moderator wallet to access this page.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
          >
            ← Back to Task Board
          </button>
        </div>
      </WalletGate>
    );
  }

  return (
    <WalletGate>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className={`font-display text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Moderator Dashboard
            </h1>
            <span className="text-xs px-2 py-1 rounded-full bg-violet-600 text-white font-semibold">Admin</span>
          </div>
          <p className={`text-sm italic font-light ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Manage tasks, approve submissions, and create new tasks.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Pending", value: pendingTasks.length, color: "text-yellow-400" },
            { label: "Approved", value: approvedTasks.length, color: "text-green-400" },
            { label: "Total", value: tasks.length, color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className={`${cardClass} text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 p-1 rounded-xl w-fit ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`}>
          <button className={tabClass("pending")} onClick={() => setTab("pending")}>
            Pending ({pendingTasks.length})
          </button>
          <button className={tabClass("approved")} onClick={() => setTab("approved")}>
            Approved ({approvedTasks.length})
          </button>
          <button className={tabClass("create")} onClick={() => setTab("create")}>
            + Create Task
          </button>
        </div>

        {/* Pending Tab */}
        {tab === "pending" && (
          <div>
            {pendingTasks.length === 0 ? (
              <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                <div className="text-3xl mb-2">✅</div>
                <p>No tasks pending approval.</p>
              </div>
            ) : (
              pendingTasks.map((task) => <TaskRow key={task.id} task={task} showApprove={true} />)
            )}
          </div>
        )}

        {/* Approved Tab */}
        {tab === "approved" && (
          <div>
            {approvedTasks.length === 0 ? (
              <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                <div className="text-3xl mb-2">📋</div>
                <p>No approved tasks yet.</p>
              </div>
            ) : (
              approvedTasks.map((task) => <TaskRow key={task.id} task={task} showApprove={false} />)
            )}
          </div>
        )}

        {/* Create Task Tab */}
        {tab === "create" && (
          <div className={cardClass}>
            <h2 className={`font-display text-xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Create New Task
            </h2>
            <p className={`text-sm italic font-light mb-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Tasks created by the moderator are automatically approved and go live immediately.
            </p>

            {createSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-600/20 border border-green-600/40 text-green-400 text-sm">
                ✅ Task created and published successfully!
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className={labelClass}>Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Share our announcement on Twitter"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what needs to be done and how to submit proof..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Reward Points</label>
                <input
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className={inputClass}
                />
              </div>
              <div className={`p-3 rounded-xl border text-xs ${theme === "dark" ? "bg-yellow-950/20 border-yellow-800/40 text-yellow-300" : "bg-yellow-50 border-yellow-200 text-yellow-700"}`}>
                ⚠️ Points are not incentivized and not tied to GenLayer portal points.
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition"
              >
                Publish Task
              </button>
            </form>
          </div>
        )}
      </div>
    </WalletGate>
  );
}
