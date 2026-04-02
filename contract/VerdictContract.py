# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

THRESHOLD = 60


class VerdictContract(gl.Contract):

    tasks: TreeMap[str, str]
    task_ids: DynArray[str]
    submissions: TreeMap[str, str]
    task_submission_ids: TreeMap[str, str]
    submission_voters: TreeMap[str, str]
    user_points: TreeMap[str, str]

    def __init__(self) -> None:
        pass

    @gl.public.write
    def create_task(self, task_id: str, title: str, description: str, keywords: str, reward_points: str) -> None:
        import json
        assert task_id not in self.tasks, "Task exists"
        assert len(title) > 0, "Title required"
        assert len(description) > 0, "Description required"
        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "keywords": keywords,
            "reward_points": reward_points,
            "creator": str(gl.message.sender_address),
        }
        self.tasks[task_id] = json.dumps(task)
        self.task_ids.append(task_id)
        self.task_submission_ids[task_id] = ""

    @gl.public.write
    def delete_task(self, task_id: str) -> None:
        assert task_id in self.tasks, "Task not found"
        del self.tasks[task_id]

    @gl.public.write
    def submit_task(self, submission_id: str, task_id: str, link: str) -> None:
        import json
        assert task_id in self.tasks, "Task not found"
        assert submission_id not in self.submissions, "Submission exists"

        task = json.loads(self.tasks[task_id])
        sender = str(gl.message.sender_address)

        assert sender.lower() != task["creator"].lower(), "Creator cannot submit"

        existing = self.task_submission_ids[task_id] if task_id in self.task_submission_ids else ""
        if existing:
            for sid in existing.split(","):
                sid = sid.strip()
                if sid and sid in self.submissions:
                    s = json.loads(self.submissions[sid])
                    assert s["submitted_by"].lower() != sender.lower(), "Already submitted"

        ai_score, ai_verdict = self._verify(link, task["keywords"], sender)
        points_awarded = ai_score

        sub = {
            "id": submission_id,
            "task_id": task_id,
            "submitted_by": sender,
            "link": link,
            "ai_score": str(ai_score),
            "ai_verdict": ai_verdict,
            "points_awarded": str(points_awarded),
            "disputed": "false",
            "dispute_resolved": "false",
            "votes_agree": "0",
            "votes_disagree": "0",
        }
        self.submissions[submission_id] = json.dumps(sub)
        self.submission_voters[submission_id] = ""

        current_ids = self.task_submission_ids[task_id] if task_id in self.task_submission_ids else ""
        self.task_submission_ids[task_id] = (current_ids + "," + submission_id).strip(",")

        if ai_verdict == "Approved":
            current = int(self.user_points[sender]) if sender in self.user_points else 0
            self.user_points[sender] = str(current + points_awarded)

    def _verify(self, link: str, keywords: str, submitter: str):
        import json

        try:
            page = gl.get_webpage(link, mode="text")
        except Exception:
            return 0, "Rejected"

        prompt = f"""You are an AI verifier for the Veridict platform on GenLayer.

Analyze this tweet page content and answer 3 checks:
CHECK 1: Is this a real publicly accessible tweet? (true/false)
CHECK 2: Does the tweet mention any of these keywords: {keywords}? (true/false)
CHECK 3: Is there any sign this tweet is linked to wallet {submitter}? Give benefit of the doubt if uncertain. (true/false)

Tweet content:
\"\"\"
{page[:2000]}
\"\"\"

Reply ONLY with valid JSON like this:
{{"check1": true, "check2": true, "check3": true, "score": 85, "reason": "explanation"}}

Score guide:
- All 3 pass: 75-100
- Check1 + Check2 pass, Check3 uncertain: 60-74
- Check1 pass, Check2 fail: 20-59
- Check1 fail: 0-19"""

        result_raw = gl.eq_principle_prompt_comparative(
            prompt,
            comparative_fn=lambda a, b: abs(json.loads(a).get("score", 0) - json.loads(b).get("score", 0)) <= 15
        )

        try:
            result = json.loads(result_raw)
            score = max(0, min(100, int(result.get("score", 0))))
        except Exception:
            score = 0

        return score, "Approved" if score >= THRESHOLD else "Rejected"

    @gl.public.write
    def dispute_submission(self, submission_id: str) -> None:
        import json
        assert submission_id in self.submissions, "Not found"
        sub = json.loads(self.submissions[submission_id])
        assert sub["disputed"] == "false", "Already disputed"
        sender = str(gl.message.sender_address).lower()
        assert sender != sub["submitted_by"].lower(), "Cannot self-dispute"
        sub["disputed"] = "true"
        self.submissions[submission_id] = json.dumps(sub)

    @gl.public.write
    def vote_on_submission(self, submission_id: str, choice: str) -> None:
        import json
        assert submission_id in self.submissions, "Not found"
        assert choice in ("agree", "disagree"), "Invalid choice"

        sub = json.loads(self.submissions[submission_id])
        voter = str(gl.message.sender_address)

        assert sub["disputed"] == "true", "Not disputed"
        assert sub["dispute_resolved"] == "false", "Already resolved"

        voters_str = self.submission_voters[submission_id] if submission_id in self.submission_voters else ""
        voters = [v.strip() for v in voters_str.split(",") if v.strip()]
        for v in voters:
            assert v.lower() != voter.lower(), "Already voted"

        voters.append(voter)
        self.submission_voters[submission_id] = ",".join(voters)

        votes_agree = int(sub["votes_agree"])
        votes_disagree = int(sub["votes_disagree"])

        if choice == "agree":
            votes_agree += 1
        else:
            votes_disagree += 1

        sub["votes_agree"] = str(votes_agree)
        sub["votes_disagree"] = str(votes_disagree)

        total = votes_agree + votes_disagree
        if total >= 3:
            if votes_agree >= votes_disagree:
                sub["dispute_resolved"] = "true"
            else:
                original = sub["ai_verdict"]
                sub["ai_verdict"] = "Approved" if original == "Rejected" else "Rejected"
                sub["dispute_resolved"] = "true"
                wallet = sub["submitted_by"]
                pts = int(sub["points_awarded"])
                if original == "Approved" and sub["ai_verdict"] == "Rejected":
                    current = int(self.user_points[wallet]) if wallet in self.user_points else 0
                    self.user_points[wallet] = str(max(0, current - pts))
                if original == "Rejected" and sub["ai_verdict"] == "Approved":
                    current = int(self.user_points[wallet]) if wallet in self.user_points else 0
                    self.user_points[wallet] = str(current + pts)

        self.submissions[submission_id] = json.dumps(sub)

    @gl.public.view
    def get_tasks(self) -> list:
        import json
        result = []
        for tid in self.task_ids:
            if tid in self.tasks:
                t = json.loads(self.tasks[tid])
                ids_str = self.task_submission_ids[tid] if tid in self.task_submission_ids else ""
                t["submission_count"] = str(len([x for x in ids_str.split(",") if x.strip()]) if ids_str else 0)
                result.append(t)
        return result

    @gl.public.view
    def get_submissions(self, task_id: str) -> list:
        import json
        ids_str = self.task_submission_ids[task_id] if task_id in self.task_submission_ids else ""
        if not ids_str:
            return []
        result = []
        for sid in ids_str.split(","):
            sid = sid.strip()
            if sid and sid in self.submissions:
                s = json.loads(self.submissions[sid])
                voters_str = self.submission_voters[sid] if sid in self.submission_voters else ""
                s["voters"] = [v.strip() for v in voters_str.split(",") if v.strip()]
                result.append(s)
        return result

    @gl.public.view
    def get_points(self, wallet: str) -> int:
        return int(self.user_points[wallet]) if wallet in self.user_points else 0

    @gl.public.view
    def get_leaderboard(self) -> list:
        result = []
        for wallet in self.user_points:
            result.append({
                "wallet": wallet,
                "points": int(self.user_points[wallet]),
            })
        result.sort(key=lambda x: x["points"], reverse=True)
        return result
