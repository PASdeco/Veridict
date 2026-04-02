"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useApp } from "../../context/AppContext";
import WalletGate from "../../components/WalletGate";
import DisputePanel from "../../components/DisputePanel";
import { Submission } from "../../types";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tasks, submitTask, disputeSubmission, getTaskSubmissions, theme } = useApp();
  const { address } = useAccount();
  const router = useRouter();

  const task = tasks.find((t) => t.id === id);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitStep, setSubmitStep] = useState<"idle" | "reviewing" | "done">("idle");
  const [disputingId, setDisputingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadSubmissions();
  }, [id, tasks]);

  async function loadSubmissions() {
    setIsLoadingSubs(true);
    const data = await getTaskSubmissions(id);
    setSubmissions(data);
    setIsLoadingSubs(false);
  }

  if (!task) {
    return (
      <WalletGate>
        <div className="text-center py-20">
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Task not found.</p>
          <button onClick={() => router.push("/")} className="mt-4 text-violet-400 hover:underline text-sm">← Back</button>
        </div>
      </WalletGate>
    );
  }

  const wallet = address?.toLowerCase() ?? null;
  const isCreator = wallet === task.creator.toLowerCase();
  const mySubmission = submissions.find((s) => s.submitted_by.toLowerCase() === (wallet ?? ""));
  const hasSubmitted = !!mySubmission;
  const canSubmit = !isCreator && !hasSubmitted;

  function isValidUrl(val: string) {
    try { new URL(val); return true; } catch { return false; }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl(link)) { setLinkError("Please enter a valid URL"); return; }
    if (!address) return;
    setLinkError(""); setSubmitError(""); setIsSubmitting(true); setSubmitStep("reviewing");
    try {
      const ok = await submitTask(address, task!.id, link);
      if (ok) {
        setSubmitStep("done");
        setLink("");
        await loadSubmissions();
      } else {
        setSubmitError("Transaction failed. Please try again.");
        setSubmitStep("idle");
      }
    } catch (e: any) {
      setSubmitError(e?.message?.slice(0, 100) || "Something went wrong.");
      setSubmitStep("idle");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDispute(submissionId: string) {
    if (!address) return;
    setDisputingId(submissionId);
    try {
      await disputeSubmission(address, submissionId);
      await loadSubmissions();
    } finally {
      setDisputingId(null);
    }
  }

  function getSubmitLabel() {
    if (submitStep === "reviewing") return "🤖 AI Reviewing on GenLayer...";
    return "Submit";
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
            <span className="shrink-0 text-sm font-bold text-violet-400 bg-violet-900/30 px-3 py-1.5 rounded-lg">≤ {task.reward_points} pts</span>
          </div>
          <div className={`flex gap-4 mt-4 text-xs flex-wrap ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <span>Creator: {task.creator.slice(0, 6)}...{task.creator.slice(-4)}</span>
            <span>Keywords: {task.keywords}</span>
            <span>{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* How it works */}
        <div className={`${cardClass} mb-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>How it works</p>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {["1. Submit your proof link", "2. GenLayer AI verifies your tweet", "3. Score awarded instantly", "4. Anyone can dispute → community votes"].map((s, i) => (
              <span key={i} className={`px-2.5 py-1 rounded-full ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Submit form */}
        {canSubmit && (
          <div className={`${cardClass} mb-4`}>
            <h2 className={`font-semibold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>📎 Submit Your Work</h2>
            <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Paste your Twitter/social link. GenLayer AI will verify it contains the required keywords.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1">
                <input type="text" value={link} onChange={(e) => { setLink(e.target.value); setLinkError(""); }} placeholder="https://twitter.com/..." className={inputClass} disabled={isSubmitting} />
                {linkError && <p className="text-red-400 text-xs mt-1">{linkError}</p>}
                {submitError && <p className="text-red-400 text-xs mt-1">❌ {submitError}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition shrink-0 whitespace-nowrap">
                {getSubmitLabel()}
              </button>
            </form>
            {isSubmitting && (
              <div className={`mt-3 p-3 rounded-xl border text-xs ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div className={`flex items-center gap-2 text-violet-400`}>
                  <span>🤖</span>
                  <span>GenLayer AI is verifying your tweet on-chain...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {hasSubmitted && (
          <div className={`mb-4 p-3 rounded-xl border text-sm ${theme === "dark" ? "bg-violet-950/20 border-violet-800/40 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-700"}`}>
            ✅ You have already submitted for this task.
          </div>
        )}
        {isCreator && (
          <div className={`mb-4 p-3 rounded-xl border text-sm ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
            You created this task. You cannot submit to your own task.
          </div>
        )}

        {/* Submissions */}
        <div className="flex items-center justify-between mb-3">
          <h2 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Submissions ({submissions.length})
          </h2>
          <button onClick={loadSubmissions} className={`text-xs px-3 py-1.5 rounded-lg transition ${theme === "dark" ? "bg-white/5 hover:bg-white/10 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}>
            🔄 Refresh
          </button>
        </div>

        {isLoadingSubs ? (
          <p className={`text-sm italic text-center py-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Loading from GenLayer...</p>
        ) : submissions.length === 0 ? (
          <div className={`text-center py-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            <div className="text-3xl mb-2">📭</div>
            <p>No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const isMySubmission = sub.submitted_by.toLowerCase() === (wallet ?? "");
              const canDispute = sub.disputed === "false" && !isMySubmission && wallet;
              const aiScore = parseInt(sub.ai_score || "0");
              const verdictColor = sub.ai_verdict === "Approved" ? "text-green-400" : sub.ai_verdict === "Rejected" ? "text-red-400" : "text-yellow-400";
              const verdictBg = sub.ai_verdict === "Approved"
                ? theme === "dark" ? "bg-green-950/20 border-green-800/30" : "bg-green-50 border-green-200"
                : theme === "dark" ? "bg-red-950/20 border-red-800/30" : "bg-red-50 border-red-200";

              return (
                <div key={sub.id} className={`rounded-xl border p-4 ${isMySubmission ? "ring-2 ring-violet-500" : ""} ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          {sub.submitted_by.slice(0, 6)}...{sub.submitted_by.slice(-4)}
                        </span>
                        {isMySubmission && <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-600 text-white">you</span>}
                      </div>
                      <a href={sub.link} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline text-xs break-all">{sub.link}</a>
                    </div>
                  </div>

                  <div className={`rounded-lg border p-3 mb-3 ${verdictBg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        🤖 AI Verdict
                        {sub.disputed === "false" && <span className={`ml-2 font-normal ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(accepted by default)</span>}
                      </span>
                      <span className={`text-sm font-bold ${verdictColor}`}>{sub.ai_verdict === "Approved" ? "✅" : "❌"} {sub.ai_verdict}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>AI Score</span>
                      <span className={`font-bold ${verdictColor}`}>{sub.ai_score}/100 → {sub.points_awarded} pts</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                      <div className={`h-full transition-all duration-700 ${sub.ai_verdict === "Approved" ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${aiScore}%` }} />
                    </div>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
                      Threshold: 60 — {aiScore >= 60 ? "Meets threshold ✓" : "Below threshold ✗"}
                    </p>
                    {sub.disputed === "false" && sub.dispute_resolved === "false" && (
                      <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        Result accepted by default. Disagree? Challenge it below.
                      </p>
                    )}
                    {sub.dispute_resolved === "true" && (
                      <div className={`mt-2 text-xs px-2 py-1 rounded-lg inline-block ${theme === "dark" ? "bg-violet-900/30 text-violet-300" : "bg-violet-50 text-violet-700"}`}>
                        ⚖️ Resolved by community ({sub.votes_agree} agree · {sub.votes_disagree} disagree)
                      </div>
                    )}
                  </div>

                  {canDispute && (
                    <button
                      onClick={() => handleDispute(sub.id)}
                      disabled={disputingId === sub.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold transition"
                    >
                      {disputingId === sub.id ? "⏳ Submitting..." : "⚖️ Challenge This Decision"}
                    </button>
                  )}
                  {isMySubmission && sub.ai_verdict === "Rejected" && sub.disputed === "false" && (
                    <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      Your submission was rejected. Others can challenge this on your behalf.
                    </p>
                  )}
                  {sub.disputed === "true" && <DisputePanel submissionId={sub.id} submission={sub} onVoted={loadSubmissions} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WalletGate>
  );
}
