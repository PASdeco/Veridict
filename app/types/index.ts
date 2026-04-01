export type AIVerdict = "Approved" | "Rejected" | "Pending";

export interface Submission {
  id: string;
  taskId: string;
  submittedBy: string;
  link: string;
  aiScore: number;
  aiVerdict: AIVerdict;
  disputed: boolean;
  disputeResolved: boolean;
  disputeEndsAt: number | null;
  votes: { agree: number; disagree: number };
  voters: string[];
  submittedAt: number;
  pointsAwarded: number; // actual AI score used as points
}

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardPoints: number; // max points possible
  creator: string;
  approvedByModerator: boolean;
  submissions: Submission[];
  createdAt: number;
}

export interface AppContextType {
  tasks: Task[];
  createTask: (wallet: string | null, title: string, description: string, rewardPoints: number, autoApprove?: boolean) => void;
  submitTask: (wallet: string | null, taskId: string, link: string) => void;
  disputeSubmission: (taskId: string, submissionId: string) => void;
  voteOnSubmission: (wallet: string | null, taskId: string, submissionId: string, choice: "agree" | "disagree") => void;
  approveTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  userPoints: Record<string, number>;
  theme: "dark" | "light";
  toggleTheme: () => void;
  MODERATOR_ADDRESS: string;
}
