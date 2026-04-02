"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppContextType, Task, Submission } from "../types";
import * as gl from "../lib/genLayerClient";

const AppContext = createContext<AppContextType | null>(null);
const MODERATOR_ADDRESS = "0x3eDF36124385e20cec36A10b7C971cFb0a6a886C";

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("veridict_theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
    refreshTasks();
    // Poll every 20 seconds
    pollRef.current = setInterval(refreshTasks, 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("veridict_theme", next);
      return next;
    });
  }, []);

  const refreshTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    try {
      const data = await gl.getTasks();
      if (data && data.length >= 0) {
        // Map chain data to Task type, attach empty submissions array
        const mapped: Task[] = data.map((t: any) => ({
          ...t,
          submissions: [],
        }));
        setTasks(mapped);
      }
    } catch (e) {
      console.error("refreshTasks error:", e);
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  const delayedRefresh = useCallback(async () => {
    await refreshTasks();
    setTimeout(refreshTasks, 5000);
    setTimeout(refreshTasks, 15000);
  }, [refreshTasks]);

  const refreshPoints = useCallback(async (wallet: string) => {
    try {
      const pts = await gl.getPoints(wallet);
      setUserPoints((prev) => ({ ...prev, [wallet]: pts }));
    } catch (e) {
      console.error("refreshPoints error:", e);
    }
  }, []);

  const getTaskSubmissions = useCallback(async (taskId: string): Promise<Submission[]> => {
    try {
      const data = await gl.getSubmissions(taskId);
      return (data as Submission[]) || [];
    } catch (e) {
      console.error("getTaskSubmissions error:", e);
      return [];
    }
  }, []);

  // Task creation is done via GenLayer Studio directly — this is a no-op on frontend
  const createTask = useCallback(async (
    wallet: string,
    title: string,
    description: string,
    keywords: string,
    rewardPoints: string
  ): Promise<boolean> => {
    // Tasks are created via GenLayer Studio UI, not from this frontend
    // Refresh to pick up any new tasks created in Studio
    await delayedRefresh();
    return true;
  }, [delayedRefresh]);

  const submitTask = useCallback(async (
    wallet: string,
    taskId: string,
    link: string
  ): Promise<boolean> => {
    const submissionId = generateId();
    const ok = await gl.submitTask(wallet, submissionId, taskId, link);
    if (ok) {
      await delayedRefresh();
      setTimeout(() => refreshPoints(wallet), 5000);
    }
    return ok;
  }, [delayedRefresh, refreshPoints]);

  const disputeSubmission = useCallback(async (
    wallet: string,
    submissionId: string
  ): Promise<boolean> => {
    const ok = await gl.disputeSubmission(wallet, submissionId);
    if (ok) await delayedRefresh();
    return ok;
  }, [delayedRefresh]);

  const voteOnSubmission = useCallback(async (
    wallet: string,
    submissionId: string,
    choice: "agree" | "disagree"
  ): Promise<boolean> => {
    const ok = await gl.voteOnSubmission(wallet, submissionId, choice);
    if (ok) await delayedRefresh();
    return ok;
  }, [delayedRefresh]);

  const deleteTask = useCallback(async (
    wallet: string,
    taskId: string
  ): Promise<boolean> => {
    // Also done via Studio — just refresh
    await delayedRefresh();
    return true;
  }, [delayedRefresh]);

  return (
    <AppContext.Provider value={{
      tasks,
      isLoadingTasks,
      createTask,
      submitTask,
      disputeSubmission,
      voteOnSubmission,
      deleteTask,
      refreshTasks,
      getTaskSubmissions,
      userPoints,
      refreshPoints,
      theme,
      toggleTheme,
      MODERATOR_ADDRESS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
