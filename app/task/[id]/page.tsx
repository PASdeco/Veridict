"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useApp } from "../../context/AppContext";
import WalletGate from "../../components/WalletGate";
import DisputePanel from "../../components/DisputePanel";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tasks, submitTask, disputeSubmission, theme } = useApp();
  const { address } = useAccount();
  const router = useRouter();

  const task = tasks.find((t) => t.id === id);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) {
    return (
      <WalletGate>
        <div className="text-center py-20">
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Task not found.</p>
          <button onClick={() => router.push("/")} className="mt-4 text-violet-400 hover:underline text-sm">
            ← Back to Task Board
          </button>
        </div>
      </WalletGate>
    );
  }

  const wallet = address?.toLowerCase() ?? null;
  const isCreator = wallet === task.creator.toLowerCase();
  const mySubmission = task.submissions.find((s) => s.submittedBy.toLowerCase() === (wallet ?? ""));
  const hasSubmitted = !!mySubmission;
  const canSubmit = !isCreator && !hasSubmitted;

  function isValidUrl(val: string) {
    try { new URL(val); return true; } catch { return false; }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl(link)) { setLinkError("Please enter a valid URL (e.g. https://twitter.com/...)"); return; }
    setLinkError("");
    setIsSubmitting(true);
    setTimeout(() => {
      submitTask(address ?? null, task!.id, link);
      setLink("");
      setIsSubmitting(false);
    }, 1500);
  }

  const cardClass = `rounded-xl border p-5 ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`;
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2 focus:ring-violet-500 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;

  return (
    <WalletGate>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/")} className={`text-sm mb-6 hover:underline ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          ← Back to Task Board
        </button>

        {/* Task Header */}
        <div className={`${cardClass} mb-4`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{task.title}</h1>
              <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{task.description}</p>
            </div>
            <span className="shrink-0 text-sm font-bold text-violet-400 bg-violet-900/30 px-3 py-1.5 rounded-lg">
              up to {task.rewardPoints} pts
            </span>
          </div>
          <div className={`flex gap-4 mt-4 text-xs flex-wrap ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <span>Creator: {task.creator.slice(0, 6)}...{task.creator.slice(-4)}</span>
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            <span>{task.submissions.length} submission{task.submissions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* How it works */}
        <div className={`${cardClass} mb-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>How it works</p>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {[
              "1. Submit your proof link",
              "2. AI reviews instantly & awards points = AI score",
              "3. Result accepted by default",
              "4. Anyone can dispute → community votes",
            ].map((step, i) => (
              <span key={i} className={`px-2.5 py-1 rounded-full ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Submit form */}
        {canSubmit && (
          <div className={`${cardClass} mb-4`}>
            <h2 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              📎 Submit Your Work
            </h2>
            <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Paste your proof link. AI will score it instantly (0–100). Your points = your AI score.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => { setLink(e.target.value); setLinkError(""); }}
                  placeholder="https://twitter.com/..."
                  className={inputClass}
                  disabled={isSubmitting}
                />
                {linkError && <p className="text-red-400 text-xs mt-1">{linkError}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition shrink-0"
              >
                {isSubmitting ? "🤖 Reviewing..." : "Submit"}
              </button>
            </form>
          </div>
        )}

        {/* Already submitted notice */}
        {hasSubmitted && (
          <div className={`mb-4 p-3 rounded-xl border text-sm ${theme === "dark" ? "bg-violet-950/20 border-violet-800/40 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-700"}`}>
            ✅ You have already submitted for this task. See your result below.
          </div>
        )}

        {/* Creator notice */}
        {isCreator && (
          <div className={`mb-4 p-3 rounded-xl border text-sm ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
            You created this task. You cannot submit to your own task.
          </div>
        )}

        {/* All Submissions */}
        {task.submissions.length > 0 && (
          <div>
            <h2 className={`font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Submissions ({task.submissions.length})
            </h2>
            <div className="space-y-4">
              {task.submissions.map((sub) => {
                const isMySubmission = sub.submittedBy.toLowerCase() === (wallet ?? "");
                const canDispute = !sub.disputed && !isMySubmission && wallet;
                const verdictColor = sub.aiVerdict === "Approved" ? "text-green-400" : sub.aiVerdict === "Rejected" ? "text-red-400" : "text-yellow-400";
                const verdictBg = sub.aiVerdict === "Approved"
                  ? theme === "dark" ? "bg-green-950/20 border-green-800/30" : "bg-green-50 border-green-200"
                  : theme === "dark" ? "bg-red-950/20 border-red-800/30" : "bg-red-50 border-red-200";

                return (
                  <div key={sub.id} className={`rounded-xl border p-4 ${isMySubmission ? "ring-2 ring-violet-500" : ""} ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    {/* Submitter + link */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-mono font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                            {sub.submittedBy.slice(0, 6)}...{sub.submittedBy.slice(-4)}
                          </span>
                          {isMySubmission && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-600 text-white">you</span>
                          )}
                          <span className={`text-xs ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
                            {new Date(sub.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:underline text-xs break-all"
                        >
                          {sub.link}
                        </a>
                      </div>
                    </div>

                    {/* AI Verdict card */}
                    <div className={`rounded-lg border p-3 mb-3 ${verdictBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          🤖 AI Verdict
                          {!sub.disputed && (
                            <span className={`ml-2 font-normal ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                              (accepted by default)
                            </span>
                          )}
                        </span>
                        <span className={`text-sm font-bold ${verdictColor}`}>
                          {sub.aiVerdict === "Approved" ? "✅" : "❌"} {sub.aiVerdict}
                        </span>
                      </div>
                      {/* Score bar */}
                      <div className="mb-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>AI Score</span>
                          <span className={`font-bold ${verdictColor}`}>{sub.aiScore}/100 → {sub.pointsAwarded} pts awarded</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                          <div
                            className={`h-full transition-all duration-700 ${sub.aiVerdict === "Approved" ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${sub.aiScore}%` }}
                          />
                        </div>
                        <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
                          Threshold: 60 — {sub.aiScore >= 60 ? "Meets threshold ✓" : "Below threshold ✗"}
                        </p>
                      </div>

                      {!sub.disputed && !sub.disputeResolved && (
                        <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                          Result accepted by default. Disagree? Challenge it below.
                        </p>
                      )}

                      {/* Dispute resolved badge */}
                      {sub.disputeResolved && (
                        <div className={`mt-2 text-xs px-2 py-1 rounded-lg inline-block ${theme === "dark" ? "bg-violet-900/30 text-violet-300" : "bg-violet-50 text-violet-700"}`}>
                          ⚖️ Resolved by community vote ({sub.votes.agree} agree · {sub.votes.disagree} disagree)
                        </div>
                      )}
                    </div>

                    {/* Challenge button */}
                    {canDispute && (
                      <button
                        onClick={() => disputeSubmission(task.id, sub.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
                      >
                        ⚖️ Challenge This Decision
                      </button>
                    )}

                    {/* Submitter rejected notice */}
                    {isMySubmission && sub.aiVerdict === "Rejected" && !sub.disputed && (
                      <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        Your submission was rejected. Other users can challenge this on your behalf.
                      </p>
                    )}

                    {/* Dispute Panel */}
                    {sub.disputed && <DisputePanel taskId={task.id} submission={sub} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {task.submissions.length === 0 && !canSubmit && !isCreator && (
          <div className={`text-center py-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <div className="text-3xl mb-2">📭</div>
            <p>No submissions yet. Be the first to submit!</p>
          </div>
        )}
      </div>
    </WalletGate>
  );
}
