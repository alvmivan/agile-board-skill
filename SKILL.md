---
name: agile-board
description: Manage agile board tasks and tickets using the GitHub CLI (gh). Enables agents to fetch tasks, move them across the board, and create new ones.
---

# Agile Board Management Skill

This skill allows you to manage tasks on an Agile Board directly using the `gh` CLI. You do not need to connect to an external server; instead, use standard CLI commands to read and update issues.

## Workflow Rules
1. **Always Check the Board**: Before starting a new task, fetch the current active tasks to understand priorities.
2. **Update Status Promptly**: When you start working on a task, move it to "In Progress". When you finish, move it to "Done".
3. **Link Pull Requests**: If you create a PR for a task, mention the issue number so it closes automatically (e.g., `Closes #123`).

## Available Actions (GitHub)

### 1. Fetching Tasks
To see tasks on the board, use `gh issue list` and filter by labels (which represent board columns like "To Do", "In Progress", "Done").

**Command:**
```bash
gh issue list --label "To Do" --json number,title,state,assignees,labels
```
*(You can change the label to match the specific column you are looking for).*

### 2. Updating Task Status
To move a task across the board, you add the new status label and remove the old one using `gh issue edit`.

**Command:**
```bash
gh issue edit <issue-number> --add-label "In Progress" --remove-label "To Do"
```

### 3. Creating a New Task
To create a new task on the board.

**Command:**
```bash
gh issue create --title "Task Title" --body "Detailed description of the task." --label "To Do"
```

### 4. Adding Comments
To add progress updates or notes to a task.

**Command:**
```bash
gh issue comment <issue-number> --body "Starting work on this task. Found X and Y."
```

## Important Notes
- Always run these commands using the `run_command` tool.
- The `gh` CLI must be authenticated and you must be in the correct repository directory, or you can pass the `--repo <owner>/<repo>` flag to all commands.
