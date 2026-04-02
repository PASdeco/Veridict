import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export const CONTRACT_ADDRESS = "0x131889FCE06bE46D3F86c6631c2A569197a6BBDD";

const STUDIONET_CHAIN_ID_HEX = "0xF22F"; // 61999

export const readClient = createClient({ chain: studionet });

async function switchToStudionet() {
  if (typeof window === "undefined") return;
  const ethereum = (window as any).ethereum;
  if (!ethereum) throw new Error("No wallet found.");
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: STUDIONET_CHAIN_ID_HEX }],
    });
  } catch (err: any) {
    if (err.code === 4902 || err.code === -32603) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: STUDIONET_CHAIN_ID_HEX,
          chainName: "GenLayer Studionet",
          nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          rpcUrls: ["https://studio.genlayer.com/api"],
          blockExplorerUrls: ["https://studio.genlayer.com"],
        }],
      });
    } else {
      throw err;
    }
  }
}

function getWriteClient(address: string) {
  return createClient({
    chain: studionet,
    account: address as `0x${string}`,
    provider: typeof window !== "undefined" ? (window as any).ethereum : undefined,
  });
}

async function waitForTx(client: any, txHash: string): Promise<boolean> {
  try {
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
    });
    console.log("tx receipt:", JSON.stringify(receipt));
    return receipt.txExecutionResultName !== "FINISHED_WITH_ERROR";
  } catch (e: any) {
    if (e?.message?.includes("Timed out")) {
      console.log("tx assumed success (timeout):", txHash);
      return true;
    }
    throw e;
  }
}

// ── READ FUNCTIONS ──────────────────────────────────────────────────────────

export async function getTasks(): Promise<any[]> {
  try {
    const result = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_tasks",
      args: [],
    });
    return (result as any[]) || [];
  } catch (e) {
    console.error("getTasks error:", e);
    return [];
  }
}

export async function getSubmissions(taskId: string): Promise<any[]> {
  try {
    const result = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_submissions",
      args: [taskId],
    });
    return (result as any[]) || [];
  } catch (e) {
    console.error("getSubmissions error:", e);
    return [];
  }
}

export async function getPoints(wallet: string): Promise<number> {
  try {
    const result = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_points",
      args: [wallet],
    });
    return Number(result) || 0;
  } catch (e) {
    console.error("getPoints error:", e);
    return 0;
  }
}

export async function getLeaderboard(): Promise<any[]> {
  try {
    const result = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_leaderboard",
      args: [],
    });
    return (result as any[]) || [];
  } catch (e) {
    console.error("getLeaderboard error:", e);
    return [];
  }
}

// ── USER WRITE FUNCTIONS (MetaMask) ─────────────────────────────────────────

export async function submitTask(
  address: string,
  submissionId: string,
  taskId: string,
  link: string
): Promise<boolean> {
  await switchToStudionet();
  const client = getWriteClient(address);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "submit_task",
    args: [submissionId, taskId, link],
    value: BigInt(0),
  });
  console.log("submitTask txHash:", txHash);
  return waitForTx(client, txHash);
}

export async function disputeSubmission(
  address: string,
  submissionId: string
): Promise<boolean> {
  await switchToStudionet();
  const client = getWriteClient(address);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "dispute_submission",
    args: [submissionId],
    value: BigInt(0),
  });
  return waitForTx(client, txHash);
}

export async function voteOnSubmission(
  address: string,
  submissionId: string,
  choice: "agree" | "disagree"
): Promise<boolean> {
  await switchToStudionet();
  const client = getWriteClient(address);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "vote_on_submission",
    args: [submissionId, choice],
    value: BigInt(0),
  });
  return waitForTx(client, txHash);
}
