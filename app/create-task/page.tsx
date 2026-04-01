"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useApp } from "../context/AppContext";
import WalletGate from "../components/WalletGate";

export default function CreateTaskPage() {
  const { createTask, theme } = useApp();
  const { address } = useAccount();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState(100);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    createTask(address ?? null, title.trim(), description.trim(), rewardPoints);
    setSubmitted(true);
  }

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-violet-500 ${
    theme === "dark"
      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`;

  if (submitted) {
    return (
      <WalletGate>
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Task Submitted!
          </h2>
          <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Your task is pending moderator approval before it appears publicly.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); setRewardPoints(100); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${theme === "dark" ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
            >
              Create Another
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white transition"
            >
              Go to Task Board
            </button>
          </div>
        </div>
      </WalletGate>
    );
  }

  return (
    <WalletGate>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Create Task
          </h1>
          <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Tasks require moderator approval before going live.
          </p>
        </div>

        <div className={`mb-6 p-4 rounded-xl border text-sm ${theme === "dark" ? "bg-yellow-950/20 border-yellow-800/40 text-yellow-300" : "bg-yellow-50 border-yellow-200 text-yellow-700"}`}>
          ⚠️ Points are not incentivized and not tied to GenLayer portal points.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Share our post on Twitter"
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

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition"
          >
            Submit for Approval
          </button>
        </form>
      </div>
    </WalletGate>
  );
}
