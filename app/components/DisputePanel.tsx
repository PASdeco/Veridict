"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Submission } from "../types";
import { useApp } from "../context/AppContext";

interface Props {
  submissionId: string;
  submission: Submission;
  onVoted: () => void;
}

export default function DisputePanel({ submissionId, submission, onVoted }: Props) {
  const { voteOnSubmission, theme } = useApp();
  const { address } = useAccount();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    const endsAt = parseInt(submission.dispute_ends_at || "0");
    if (!endsAt) return;
    const interval = setInterval(() => {
      const diff = endsAt * 1000 - Date.now();
      if (diff <= 0) { setTimeLeft("Voting ended"); clearInterval(interval); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s remaining`);
    }, 1000);
    return () => clearInterval(interval);
  }, [submission.dispute_ends_at]);

  const hasVoted = address ? submission.voters.map((v) => v.toLowerCase()).includes(address.toLowerCase()) : false;
  const votesAgree = parseInt(submission.votes_agree || "0");
  const votesDisagree = parseInt(submission.votes_disagree || "0");
  const total = votesAgree + votesDisagree;
  const agreePercent = total > 0 ? Math.round((votesAgree / total) * 100) : 0;
  const isResolved = submission.dispute_resolved === "true";

  async function handleVote(choice: "agree" | "disagree") {
    if (!address) return;
    setIsVoting(true);
    setVoteError("");
    try {
      const ok = await voteOnSubmission(address, submissionId, choice);
      if (ok) onVoted();
      else setVoteError("Vote failed. Please try again.");
    } catch (e: any) {
      setVoteError(e?.message?.slice(0, 80) || "Something went wrong.");
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className={`rounded-xl border p-4 mt-3 ${theme === "dark" ? "bg-orange-950/20 border-orange-800/40" : "bg-orange-50 border-orange-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold text-sm ${theme === "dark" ? "text-orange-300" : "text-orange-700"}`}>⚖️ Community Vote</h4>
        {isResolved ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-violet-900/40 text-violet-300" : "bg-violet-100 text-violet-700"}`}>Resolved</span>
        ) : timeLeft ? (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-orange-900/40 text-orange-400" : "bg-orange-100 text-orange-600"}`}>{timeLeft}</span>
        ) : null}
      </div>

      <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        Majority vote (3+) determines the final verdict.
      </p>

      <div className={`flex items-center gap-2 text-xs mb-3 p-2 rounded-lg ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
        <span>🤖 AI said:</span>
        <span className={`font-bold ${submission.ai_verdict === "Approved" ? "text-green-400" : "text-red-400"}`}>
          {submission.ai_verdict === "Approved" ? "✅ Approved" : "❌ Rejected"}
        </span>
        <span className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>(Score: {submission.ai_score}/100)</span>
        <span className={`ml-auto ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Do you agree?</span>
      </div>

      {!isResolved && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleVote("agree")}
            disabled={hasVoted || !address || isVoting}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${hasVoted || isVoting ? "opacity-40 cursor-not-allowed bg-gray-700 text-gray-400" : "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            {isVoting ? "⏳..." : `👍 Agree with AI (${votesAgree})`}
          </button>
          <button
            onClick={() => handleVote("disagree")}
            disabled={hasVoted || !address || isVoting}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${hasVoted || isVoting ? "opacity-40 cursor-not-allowed bg-gray-700 text-gray-400" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            {isVoting ? "⏳..." : `👎 Disagree (${votesDisagree})`}
          </button>
        </div>
      )}

      {voteError && <p className="text-red-400 text-xs mb-2">{voteError}</p>}

      {total > 0 && (
        <div className="mb-2">
          <div className={`h-2.5 rounded-full overflow-hidden flex ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${agreePercent}%` }} />
            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${100 - agreePercent}%` }} />
          </div>
          <div className={`flex justify-between text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <span>👍 {agreePercent}%</span>
            <span>{total} vote{total !== 1 ? "s" : ""}{!isResolved ? ` · ${Math.max(0, 3 - total)} more to finalize` : ""}</span>
            <span>👎 {100 - agreePercent}%</span>
          </div>
        </div>
      )}

      {isResolved && (
        <div className={`p-2.5 rounded-lg text-xs font-semibold mt-2 ${submission.ai_verdict === "Approved" ? theme === "dark" ? "bg-green-900/30 text-green-300 border border-green-800/40" : "bg-green-50 text-green-700 border border-green-200" : theme === "dark" ? "bg-red-900/30 text-red-300 border border-red-800/40" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {votesAgree >= votesDisagree
            ? `✅ Community aligned with AI — verdict stands: ${submission.ai_verdict}`
            : `🔄 Community overrode AI — final verdict: ${submission.ai_verdict}`}
        </div>
      )}

      {hasVoted && !isResolved && (
        <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>✅ Your vote is recorded on GenLayer.</p>
      )}
    </div>
  );
}
