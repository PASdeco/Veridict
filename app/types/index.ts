export type AIVerdict = "Approved" | "Rejected" | "Pending";

export interface Submission {
  id: string;
  task_id: string;
  submitted_by: string;
  link: string;
  ai_score: string;
  ai_verdict: AIVerdict;
  points_awarded: string;
  disputed: string;
  dispute_resolved: string;
  dispute_ends_at: string;
  votes_agree: string;
  votes_disagree: string;
  submitted_at: string;
  voters: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  keywords: string;
  reward_points: string;
  creator: string;
  created_at: string;
  submission_count: string;
  submissions?: Submission[];
}

export interface AppContextType {
  tasks: Task[];
  isLoadingTasks: boolean;
  createTask: (wallet: string, title: string, description: string, keywords: string, rewardPoints: string) => Promise<boolean>;
  submitTask: (wallet: string, taskId: string, link: string) => Promise<boolean>;
  disputeSubmission: (wallet: string, submissionId: string) => Promise<boolean>;
  voteOnSubmission: (wallet: string, submissionId: string, choice: "agree" | "disagree") => Promise<boolean>;
  deleteTask: (wallet: string, taskId: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
  getTaskSubmissions: (taskId: string) => Promise<Submission[]>;
  userPoints: Record<string, number>;
  refreshPoints: (wallet: string) => Promise<void>;
  theme: "dark" | "light";
  toggleTheme: () => void;
  MODERATOR_ADDRESS: string;
}
