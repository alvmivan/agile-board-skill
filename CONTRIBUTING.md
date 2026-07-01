# 🤝 Contributing to Agile Board Skill

First off, thank you for considering contributing to Agile Board Skill! 

The core philosophy of this tool is to provide AI Agents with a **token-efficient, unified interface** to interact with ANY agile board platform. We achieve this using the **Adapter Pattern**.

## 🔌 How to Add a New Adapter (e.g., Jira, Trello, Supabase)

Adding support for a new platform is incredibly easy and won't affect how the AI Agents use the skill.

1. **Create your Adapter File**
   In the `scripts/adapters/` directory, create a new file (e.g., `supabase.js`).
   
2. **Implement the Interface**
   Your class MUST extend the `AgileAdapter` from `interface.js` and implement all its asynchronous methods. Ensure your methods return concise data to save tokens!

   ```javascript
   import { AgileAdapter } from './interface.js';

   export class SupabaseAdapter extends AgileAdapter {
     async listTasks(status) {
       // Fetch tasks from Supabase and map them to:
       // [{ id, title, status, assignee }]
     }
     
     async takeTask(id) {
       // Assign the task to the current user and move to "In Progress"
       // Return: { success: true, message: "..." }
     }
     
     // ... implement updateTask, commentOnTask, createTask
   }
   ```

3. **Register your Adapter**
   Open `scripts/agile.js` and add your new adapter to the routing logic:

   ```javascript
   import { GithubAdapter } from './adapters/github.js';
   import { SupabaseAdapter } from './adapters/supabase.js'; // <-- Add this

   const backend = process.env.AGILE_BACKEND || 'github';
   let adapter;

   if (backend === 'github') {
     adapter = new GithubAdapter();
   } else if (backend === 'supabase') {      // <-- Add this
     adapter = new SupabaseAdapter();        // <-- Add this
   } else {
     console.error(`Backend ${backend} not supported yet.`);
     process.exit(1);
   }
   ```

4. **Submit a Pull Request!**
   That's it! Open a PR and we'll review it.

## 🐛 Bug Reports & Feature Requests
Please use the GitHub Issues tab to report bugs or suggest new features. Ensure you provide as much context as possible.
