"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppContextType, Task, Submission, AIVerdict } from "../types";

const AppContext = createContext<AppContextType | null>(null);
const MODERATOR_ADDRESS = "0x4c5A99FF7a0B7F04e356b40BC0493DDA66A9338f";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("veridict_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);
    const savedTasks = localStorage.getItem("veridict_tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    const savedPoints = localStorage.getItem("veridict_points");
    if (savedPoints) setUserPoints(JSON.parse(savedPoints));
  }, []);

  useEffect(() => { localStorage.setItem("veridict_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("veridict_points", JSON.stringify(userPoints)); }, [userPoints]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("veridict_theme", next);
      return next;
    });
  }, []);

  const createTask = useCallback(
    (wallet: string | null, title: string, description: string, rewardPoints: number, autoApprove = false) => {
      if (!wallet) return;
      const task: Task = {
        id: generateId(),
        title,
        description,
        rewardPoints,
        creator: wallet,
        approvedByModerator: autoApprove,
        submissions: [],
        createdAt: Date.now(),
      };
      setTasks((prev) => [task, ...prev]);
    },
    []
  );

  // Submit a link → AI runs immediately → points = AI score (not rewardPoints)
  const submitTask = useCallback((wallet: string | null, taskId: string, link: string) => {
    if (!wallet) return;

    // Prevent duplicate submission from same wallet on same task
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const alreadySubmitted = task.submissions.some(
      (s) => s.submittedBy.toLowerCase() === wallet.toLowerCase()
    );
    if (alreadySubmitted) return;

    // AI score = random 0–100; points awarded = the score itself
    const aiScore = Math.floor(Math.random() * 101);
    const aiVerdict: AIVerdict = aiScore >= 60 ? "Approved" : "Rejected";
    const pointsAwarded = aiScore; // points = AI score, not the task's rewardPoints

    const submission: Submission = {
      id: generateId(),
      taskId,
      submittedBy: wallet,
      link,
      aiScore,
      aiVerdict,
      disputed: false,
      disputeResolved: false,
      disputeEndsAt: null,
      votes: { agree: 0, disagree: 0 },
      voters: [],
      submittedAt: Date.now(),
      pointsAwarded,
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, submissions: [...t.submissions, submission] } : t
      )
    );

    // Optimistic Democracy: award points immediately if approved
    if (aiVerdict === "Approved") {
      setUserPoints((pts) => ({
        ...pts,
        [wallet]: (pts[wallet] || 0) + pointsAwarded,
      }));
    }
  }, [tasks]);

  // Dispute a specific submission — triggers Equivalence Principle
  const disputeSubmission = useCallback((taskId: string, submissionId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          submissions: t.submissions.map((s) =>
            s.id === submissionId
              ? { ...s, disputed: true, disputeEndsAt: Date.now() + 5 * 60 * 1000 }
              : s
          ),
        };
      })
    );
  }, []);

  // Vote on a specific submission — majority overrides AI if community disagrees
  const voteOnSubmission = useCallback(
    (wallet: string | null, taskId: string, submissionId: string, choice: "agree" | "disagree") => {
      if (!wallet) return;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            submissions: t.submissions.map((s) => {
              if (s.id !== submissionId) return s;
              if (s.voters.map(v => v.toLowerCase()).includes(wallet.toLowerCase())) return s;
              if (s.disputeResolved) return s;

              const updatedVotes = { ...s.votes, [choice]: s.votes[choice] + 1 };
              const updatedVoters = [...s.voters, wallet];
              const total = updatedVotes.agree + updatedVotes.disagree;

              if (total < 3) {
                return { ...s, votes: updatedVotes, voters: updatedVoters };
              }

              const communityAgreesWithAI = updatedVotes.agree >= updatedVotes.disagree;

              if (communityAgreesWithAI) {
                // AI + Community align → verdict stands
                return { ...s, votes: updatedVotes, voters: updatedVoters, disputeResolved: true };
              } else {
                // Community overrides AI → flip verdict
                const flippedVerdict: AIVerdict = s.aiVerdict === "Approved" ? "Rejected" : "Approved";

                // AI approved → community rejects → revoke points
                if (s.aiVerdict === "Approved" && flippedVerdict === "Rejected") {
                  setUserPoints((pts) => ({
                    ...pts,
                    [s.submittedBy]: Math.max(0, (pts[s.submittedBy] || 0) - s.pointsAwarded),
                  }));
                }

                // AI rejected → community approves → award points
                if (s.aiVerdict === "Rejected" && flippedVerdict === "Approved") {
                  setUserPoints((pts) => ({
                    ...pts,
                    [s.submittedBy]: (pts[s.submittedBy] || 0) + s.pointsAwarded,
                  }));
                }

                return {
                  ...s,
                  votes: updatedVotes,
                  voters: updatedVoters,
                  aiVerdict: flippedVerdict,
                  disputeResolved: true,
                };
              }
            }),
          };
        })
      );
    },
    []
  );

  const approveTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, approvedByModerator: true } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks,
        createTask,
        submitTask,
        disputeSubmission,
        voteOnSubmission,
        approveTask,
        deleteTask,
        userPoints,
        theme,
        toggleTheme,
        MODERATOR_ADDRESS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
