---
name: git-pr
description: Show git diff, stage changes, write a commit message, push to the current branch, then optionally create a PR. Use when the user wants to commit and push their current changes.
license: MIT
metadata:
  author: local
  version: "1.0"
---

Review staged and unstaged changes, commit them, push to the remote branch, then ask if the user wants to open a PR.

---

**Steps**

1. **Show what's changed**

   Run these in parallel:
   ```bash
   git status
   git diff HEAD
   git log --oneline -5
   ```

   Summarize the changes for the user — what files changed and what kind of work it is (new feature, fix, docs, etc.).

2. **Confirm what to stage**

   Use the **AskUserQuestion tool** to ask:
   > "Which changes should be staged for this commit?"

   Options:
   - "All changes (git add -A)" — stage everything untracked and modified
   - "Only tracked files (git add -u)" — skip untracked files
   - "Let me specify" — ask for a list of paths

   If the user picks "Let me specify", ask for the paths and stage only those.

3. **Stage the files**

   Run the appropriate `git add` command based on the user's answer.

   Then show `git diff --cached --stat` so the user can see exactly what will be committed.

4. **Write the commit message**

   Draft a commit message based on the diff:
   - First line: imperative mood, ≤72 chars, no period
   - Body (if needed): brief bullet points on what changed and why
   - Do NOT include "Co-Authored-By" lines

   Show the user the draft message and use **AskUserQuestion** to ask:
   > "Use this commit message, or edit it?"

   Options:
   - "Use it" — proceed with the drafted message
   - "Edit it" — ask the user to type their preferred message

5. **Commit**

   ```bash
   git commit -m "<message>"
   ```

   Confirm the commit was created successfully.

6. **Push**

   Push to the current branch's remote tracking branch:
   ```bash
   git push
   ```

   If no upstream is set, use `git push -u origin <branch>`.

   Show the user the push output.

7. **Check for an existing PR**

   Run:
   ```bash
   gh pr view --json number,title,url,body 2>/dev/null
   ```

   - If a PR already exists: tell the user the PR number, title, and URL. Then use **AskUserQuestion** to ask:
     > "PR #N is already open. Would you like to update the PR description?"

     Options:
     - "Yes, update the description" — draft a new PR body based on all commits since the branch diverged from main, then run `gh pr edit <number> --body "<new body>"`. Show the user the updated PR URL.
     - "No, leave it as is" — done

   - If no PR exists: use the **AskUserQuestion tool** to ask:
     > "Would you like to create a pull request?"

     Options:
     - "Yes, create a PR" — proceed to create one
     - "No, skip" — done

8. **Create the PR (if requested)**

   Draft a PR title and body based on the commits since the branch diverged from main:
   ```bash
   git log main..HEAD --oneline
   git diff main...HEAD --stat
   ```

   PR body format:
   ```
   ## Summary

   <2-4 bullet points describing what the PR does and why>

   ## Test plan

   - [ ] <key thing to verify>
   - [ ] <key thing to verify>
   ```

   Create the PR:
   ```bash
   gh pr create --title "<title>" --body "<body>"
   ```

   Return the PR URL to the user.

**Guardrails**
- NEVER push to `main` — if the current branch is `main`, stop and tell the user to create a feature branch first
- NEVER use `--no-verify` or skip hooks
- If `gh` is not authenticated, tell the user to run `gh auth login` and skip PR creation
- If there is nothing to commit (clean working tree), tell the user and stop
