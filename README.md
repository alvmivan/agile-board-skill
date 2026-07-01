# 🚀 Agile Board Skill for AI Agents

<div align="center">
  <img src="assets/logo.svg" alt="Agile Board Skill Logo" width="200" height="200" />
  <p>Empower your AI Agents to autonomously manage Agile Boards (GitHub Issues, Supabase, etc.) with extreme token efficiency.</p>
</div>

---

## 💡 Why this Skill?

LLMs and AI Agents struggle with standard APIs (like GitHub's) because they return massive JSON payloads full of irrelevant metadata. This quickly drains the context window and increases API costs.

**Agile Board Skill** solves this by acting as a smart proxy:
- **Token-Optimized:** Translates heavy API responses into ultra-concise summaries (only IDs, Titles, and Statuses).
- **Adapter Pattern:** The Agent doesn't need to know if it's talking to GitHub or Supabase. It uses one standard interface.
- **Autonomous Workflow:** Equips agents with high-level actions (`take`, `update`, `comment`) so they can update the board as they code.

## 📦 Installation

To make this skill available to your local AI Agent (like Antigravity / Gemini), just clone it into your global skills directory:

```bash
cd ~/.gemini/config/skills/
git clone https://github.com/YOUR_USERNAME/agile-board-skill.git
```
*(No `npm install` needed! Built with vanilla Node.js for zero-dependency instant execution).*

## 🛠️ How it Works

The skill is divided into two parts:
1. **The Brain (`SKILL.md`):** Instructions for the LLM on how to use the CLI and the agile workflow rules.
2. **The Muscle (`scripts/`):** A lightweight Node.js CLI that executes the actual API calls using the Adapter pattern.

### Agent Commands
The agent autonomously runs these commands in the background:
- `node scripts/agile.js list` - Fetches the board.
- `node scripts/agile.js take <id>` - Assigns the ticket to the agent and moves to "In Progress".
- `node scripts/agile.js comment <id> "msg"` - Leaves breadcrumbs of progress.

## 🤝 Extending

Want to add Jira, Trello, or Supabase? Just add a new file in `scripts/adapters/` that implements the `AgileAdapter` interface!

---
*Built for the next generation of autonomous coding agents.*
