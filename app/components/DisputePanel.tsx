"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Submission } from "../types";
import { useApp } from "../context/AppContext";

interface Props {
  taskId: string;
  submission: Submission;
}

export default function DisputePanel({ taskId, submission }: Props) {
  const { voteOnSubmission, theme } = useApp();
  const { address } = useAccount();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!submission.disputeEndsAt) return;
    const interval = setInterval(() => {
      const diff = submission.disputeEndsAt! - Date.now();
      if (diff <= 0) { setTimeLeft("Voting ended"); clearInterval(interval); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s remaining`);
    }, 1000);
    return () => clearInterval(interval);
  }, [submission.disputeEndsAt]);

  const hasVoted = address
    ? submission.voters.map((v) => v.toLowerCase()).includes(address.toLowerCase())
    : false;
  const total = submission.votes.agree + submission.votes.disagree;
  const agreePercent = total > 0 ? Math.round((submission.votes.agree / total) * 100) : 0;
  const disagreePercent = total > 0 ? 100 - agreePercent : 0;
  const isResolved = submission.disputeResolved;

  return (
    <div className={`rounded-xl border p-4 mt-3 ${theme === "dark" ? "bg-orange-950/20 border-orange-800/40" : "bg-orange-50 border-orange-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold text-sm ${theme === "dark" ? "text-orange-300" : "text-orange-700"}`}>
          ⚖️ Community Vote
        </h4>
        {isResolved ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-violet-900/40 text-violet-300" : "bg-violet-100 text-violet-700"}`}>
            Resolved
          </span>
        ) : timeLeft ? (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-orange-900/40 text-orange-400" : "bg-orange-100 text-orange-600"}`}>
            {timeLeft}
          </span>
        ) : null}
      </div>

      <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        Majority vote (3+) determines the final verdict.
      </p>

      {/* AI verdict reminder */}
      <div className={`flex items-center gap-2 text-xs mb-3 p-2 rounded-lg ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
        <span>🤖 AI said:</span>
        <span className={`font-bold ${submission.aiVerdict === "Approved" ? "text-green-400" : "text-red-400"}`}>
          {submission.aiVerdict === "Approved" ? "✅ Approved" : "❌ Rejected"}
        </span>
        <span className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>
          (Score: {submission.aiScore}/100 · {submission.pointsAwarded} pts)
        </span>
        <span className={`ml-auto ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Do you agree?</span>
      </div>

      {/* Vote buttons */}
      {!isResolved && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => voteOnSubmission(address ?? null, taskId, submission.id, "agree")}
            disabled={hasVoted || !address}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${hasVoted ? "opacity-40 cursor-not-allowed bg-gray-700 text-gray-400" : "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            👍 Agree with AI ({submission.votes.agree})
          </button>
          <button
            onClick={() => voteOnSubmission(address ?? null, taskId, submission.id, "disagree")}
            disabled={hasVoted || !address}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${hasVoted ? "opacity-40 cursor-not-allowed bg-gray-700 text-gray-400" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            👎 Disagree ({submission.votes.disagree})
          </button>
        </div>
      )}

      {/* Vote bar */}
      {total > 0 && (
        <div className="mb-2">
          <div className={`h-2.5 rounded-full overflow-hidden flex ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${agreePercent}%` }} />
            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${disagreePercent}%` }} />
          </div>
          <div className={`flex justify-between text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <span>👍 {agreePercent}%</span>
            <span>{total} vote{total !== 1 ? "s" : ""}{!isResolved ? ` · ${Math.max(0, 3 - total)} more to finalize` : ""}</span>
            <span>👎 {disagreePercent}%</span>
          </div>
        </div>
      )}

      {/* Resolution */}
      {isResolved && (
        <div className={`p-2.5 rounded-lg text-xs font-semibold mt-2 ${
          submission.aiVerdict === "Approved"
            ? theme === "dark" ? "bg-green-900/30 text-green-300 border border-green-800/40" : "bg-green-50 text-green-700 border border-green-200"
            : theme === "dark" ? "bg-red-900/30 text-red-300 border border-red-800/40" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {submission.votes.agree >= submission.votes.disagree
            ? `✅ Community aligned with AI — verdict stands: ${submission.aiVerdict}`
            : `🔄 Community overrode AI — final verdict: ${submission.aiVerdict}`}
        </div>
      )}

      {hasVoted && !isResolved && (
        <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
          ✅ Your vote is recorded.
        </p>
      )}
    </div>
  );
}
