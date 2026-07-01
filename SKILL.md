---
name: agile-board
description: Manage agile board tasks and tickets using the Skill's CLI wrapper. Enables agents to fetch tasks, move them across the board, and create new ones agnostically (GitHub/Supabase).
---

# Agile Board Management Skill

This skill allows you to manage tasks on an Agile Board using a unified CLI wrapper. By default, it communicates with GitHub Issues, but the underlying complexity is abstracted away to save your context window tokens.

## Workflow Rules
1. **Always Check the Board**: Before starting a new task, fetch the current active tasks to understand priorities.
2. **Update Status Promptly**: When you start working on a task, use the `take` command to assign it to yourself and move it to "In Progress".
3. **Log Progress**: Use the `comment` command to leave breadcrumbs of your investigation or progress on the ticket.

## Available Actions

Use the `run_command` tool to execute these actions. All commands are run via Node.js using the `scripts/agile.js` entry point.

### 1. Fetching Tasks
To see tasks on the board, optionally filtered by status (e.g., "To Do", "In Progress", "Done").

**Command:**
```bash
node scripts/agile.js list --status "To Do"
```
*(Omit `--status` to list everything)*

### 2. Taking a Task
Assigns the task to yourself and moves it to "In Progress".

**Command:**
```bash
node scripts/agile.js take <issue-number>
```

### 3. Updating Task Status (Manually)
To move a task across the board manually.

**Command:**
```bash
node scripts/agile.js update <issue-number> --status "Done"
```

### 4. Creating a New Task
To create a new task on the board.

**Command:**
```bash
node scripts/agile.js create --title "Task Title" --desc "Detailed description of the task."
```

### 5. Adding Comments
To add progress updates or notes to a task.

**Command:**
```bash
node scripts/agile.js comment <issue-number> "Starting work on this task. Found X and Y."
```

## Important Notes
- Always run these commands using the `run_command` tool.
- Ensure you are in the directory where `scripts/agile.js` is located when executing the commands.
