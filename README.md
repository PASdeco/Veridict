# Veridict — AI-Powered Task Verification on GenLayer

> *The future of work — where AI validates tasks and the community ensures fairness through decentralized consensus.*

**Live Demo:** https://veridict1-genlayer.vercel.app  
**Contract Address:** `0x131889FCE06bE46D3F86c6631c2A569197a6BBDD` (GenLayer Studionet)  
**Network:** GenLayer Studionet (Chain ID: 61999)

---

## What is Veridict?

Veridict is a decentralized task verification platform built on **GenLayer**. It allows a moderator to publish tasks (e.g. "Tweet about our project"), users to submit proof links (Twitter/social media), and GenLayer's AI to automatically verify whether the submission meets the task requirements.

The platform implements two core GenLayer concepts:

- **Optimistic Democracy** — AI results are accepted by default unless challenged
- **Equivalence Principle** — When disputed, multiple validators + community votes reach consensus

---

## How It Works

```
Moderator creates task (via GenLayer Studio)
        ↓
User submits a Twitter/social link
        ↓
GenLayer AI verifies:
  ✓ Is it a real tweet?
  ✓ Does it mention the required keywords?
  ✓ Is it linked to the submitter's wallet?
        ↓
AI Score (0–100) → Points awarded instantly if score ≥ 60
        ↓
Result accepted by default (Optimistic Democracy)
        ↓
Anyone can dispute → Community votes Agree/Disagree
        ↓
Majority (3+ votes) determines final verdict (Equivalence Principle)
```

---

## Features

- 🔐 **Wallet Connection** — MetaMask, Rabby, Zerion, Coinbase and more via RainbowKit
- 📋 **Task Board** — Browse all active tasks published by the moderator
- 📎 **Link Submission** — Submit Twitter/social proof links for AI verification
- 🤖 **Real AI Review** — GenLayer's `eq_principle` verifies submissions on-chain
- ⚖️ **Dispute System** — Challenge AI decisions, community votes to resolve
- 🏆 **Points & Leaderboard** — On-chain points tracked per wallet
- 🌙 **Dark / Light Mode** — Full theme toggle
- 📱 **Responsive Design** — Works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Wallet | RainbowKit, Wagmi, Viem |
| Blockchain | GenLayer Studionet |
| Smart Contract | GenLayer Intelligent Contract (Python) |
| SDK | genlayer-js |
| Deployment | Vercel |

---

## Intelligent Contract

The contract is written in Python using GenLayer's Intelligent Contract framework.

**Contract Address:** `0x131889FCE06bE46D3F86c6631c2A569197a6BBDD`  
**File:** `contract/VerdictContract.py`

### Contract Methods

**Write:**
- `create_task(task_id, title, description, keywords, reward_points)` — Create a new task
- `delete_task(task_id)` — Remove a task
- `submit_task(submission_id, task_id, link)` — Submit proof link, triggers AI review
- `dispute_submission(submission_id)` — Challenge an AI decision
- `vote_on_submission(submission_id, choice)` — Vote agree/disagree on a dispute

**Read:**
- `get_tasks()` — Fetch all tasks
- `get_submissions(task_id)` — Fetch submissions for a task
- `get_points(wallet)` — Get points for a wallet
- `get_leaderboard()` — Get all users ranked by points

### AI Verification Logic

```python
def _verify(self, link, keywords, submitter):
    page = gl.get_webpage(link, mode="text")  # Fetch tweet content

    prompt = f"""
    CHECK 1: Is this a real publicly accessible tweet?
    CHECK 2: Does the tweet mention: {keywords}?
    CHECK 3: Is this tweet linked to wallet {submitter}?

    Score 0-100 based on checks passed.
    """

    result = gl.eq_principle_prompt_comparative(prompt, ...)
    # Multiple validators independently verify and reach consensus
```

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/PASdeco/Veridict.git
cd Veridict/verdict1

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Creating Tasks (Moderator)

Tasks are created directly via GenLayer Studio since the contract is deployed with the Studio internal wallet:

1. Go to [studio.genlayer.com/contracts](https://studio.genlayer.com/contracts)
2. Open contract `0x131889FCE06bE46D3F86c6631c2A569197a6BBDD`
3. Under **Write Methods** → `create_task`
4. Fill in `task_id`, `title`, `description`, `keywords`, `reward_points`
5. Click **Run**
6. Task appears on the frontend within ~30 seconds

---

## Project Structure

```
verdict1/
├── app/
│   ├── components/        # Navbar, Footer, TaskCard, DisputePanel, WalletGate
│   ├── context/           # AppContext — state management + GenLayer calls
│   ├── lib/
│   │   ├── genLayerClient.ts   # GenLayer SDK integration
│   │   └── wagmiConfig.ts      # Wallet connection config
│   ├── moderator/         # Moderator dashboard
│   ├── dashboard/         # User dashboard
│   ├── leaderboard/       # Points leaderboard
│   ├── task/[id]/         # Task detail + submission + dispute
│   ├── types/             # TypeScript types
│   └── page.tsx           # Home — task board
├── contract/
│   └── VerdictContract.py # GenLayer Intelligent Contract
└── public/
    ├── logo.png
    └── bg.png
```

---

## GenLayer Concepts Used

### Optimistic Democracy
AI results are accepted by default without requiring community validation on every submission. This makes the system fast and efficient — only contested results go through the full voting process.

### Equivalence Principle
When a submission is disputed, GenLayer runs the verification across multiple independent AI validators. If they don't align, the community votes to resolve the conflict. Majority vote (3+) determines the final outcome.

---

## Ecosystem

Built on **GenLayer** — the first blockchain with native AI execution.

- [GenLayer Main](https://www.genlayer.com/)
- [Documentation](https://docs.genlayer.com/)
- [Testnet Bradbury](https://x.com/GenLayer/status/2031732035799200026?s=20)
- [Hackathon](https://portal.genlayer.foundation/#/hackathon/)

---

## Disclaimer

Points awarded on Veridict are not incentivized and not tied to GenLayer portal points. This is an MVP demonstration platform built for the GenLayer Hackathon.

---

## License

MIT
