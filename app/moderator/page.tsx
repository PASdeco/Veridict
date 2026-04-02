"use client";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import WalletGate from "../components/WalletGate";

export default function ModeratorPage() {
  const { tasks, isLoadingTasks, refreshTasks, theme, MODERATOR_ADDRESS } = useApp();
  const { address } = useAccount();
  const router = useRouter();

  const isMod = !!address && address.toLowerCase() === MODERATOR_ADDRESS.toLowerCase();

  const cardClass = `rounded-2xl border p-5 ${theme === "dark" ? "glass-dark" : "glass-light shadow-sm"}`;

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
              This panel is restricted to the moderator only.
            </p>
          </div>
          <button onClick={() => router.push("/")} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition">
            ← Back to Task Board
          </button>
        </div>
      </WalletGate>
    );
  }

  return (
    <WalletGate>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className={`font-display text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Moderator Dashboard
            </h1>
            <span className="text-xs px-2 py-1 rounded-full bg-violet-600 text-white font-semibold">Admin</span>
          </div>
          <p className={`text-sm italic font-light ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Manage tasks on GenLayer Studionet.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Total Tasks", value: tasks.length, color: "text-violet-400" },
            { label: "Total Submissions", value: tasks.reduce((a, t) => a + parseInt(t.submission_count || "0"), 0), color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className={`${cardClass} text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* How to create tasks */}
        <div className={`${cardClass} mb-6`}>
          <h2 className={`font-semibold text-lg mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            📝 How to Create Tasks
          </h2>
          <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Tasks are created directly on GenLayer via the Studio interface. Follow these steps:
          </p>
          <ol className={`space-y-3 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {[
              <>Go to <a href="https://studio.genlayer.com/contracts" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline font-medium">studio.genlayer.com/contracts</a></>,
              <>Open contract <span className="font-mono text-xs bg-black/20 px-1 rounded">0x38f07C86534ED1B94a1982C3D9f2a43E0C9928E6</span></>,
              <>Under <strong>Write Methods</strong>, click <strong>create_task</strong></>,
              <>Fill in: <strong>task_id</strong> (unique string), <strong>title</strong>, <strong>description</strong>, <strong>keywords</strong> (e.g. "GenLayer, Veridict"), <strong>reward_points</strong> (e.g. "100")</>,
              <>Click <strong>Run</strong> — Studio signs with the internal wallet automatically</>,
              <>Come back here and click <strong>🔄 Refresh</strong> to see the new task</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Task list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Live Tasks ({tasks.length})
          </h2>
          <button
            onClick={refreshTasks}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${theme === "dark" ? "bg-white/5 hover:bg-white/10 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
          >
            🔄 Refresh
          </button>
        </div>

        {isLoadingTasks ? (
          <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <p className="text-sm italic">Loading from GenLayer...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${theme === "dark" ? "border-white/5 bg-white/[0.02]" : "border-gray-200 bg-white/60"}`}>
            <div className="text-3xl mb-2">📋</div>
            <p className={`font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>No tasks yet</p>
            <p className={`text-sm mt-1 italic ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
              Create one via GenLayer Studio using the steps above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {task.title}
                    </h3>
                    <p className={`text-sm mt-1 line-clamp-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {task.description}
                    </p>
                    <div className={`flex gap-3 mt-2 text-xs flex-wrap ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      <span>Keywords: {task.keywords}</span>
                      <span>≤ {task.reward_points} pts</span>
                      <span>{task.submission_count} submissions</span>
                    </div>
                  </div>
                  <a
                    href="https://studio.genlayer.com/contracts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-700 text-white text-xs font-semibold transition shrink-0"
                  >
                    Delete via Studio
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WalletGate>
  );
}
