#!/usr/bin/env node

import { GithubAdapter } from './adapters/github.js';

// Setup environment and select adapter
const backend = process.env.AGILE_BACKEND || 'github';
let adapter;

if (backend === 'github') {
  adapter = new GithubAdapter();
} else {
  console.error(`Backend ${backend} not supported yet.`);
  process.exit(1);
}

// Simple args parser
const [, , command, ...args] = process.argv;

async function run() {
  try {
    switch (command) {
      case 'list': {
        const statusIndex = args.indexOf('--status');
        const status = statusIndex > -1 ? args[statusIndex + 1] : null;
        const tasks = await adapter.listTasks(status);
        console.log(JSON.stringify(tasks, null, 2));
        break;
      }
      case 'take': {
        const id = args[0];
        if (!id) throw new Error("Missing task ID");
        const result = await adapter.takeTask(id);
        console.log(result.message);
        break;
      }
      case 'update': {
        const id = args[0];
        if (!id) throw new Error("Missing task ID");
        const statusIndex = args.indexOf('--status');
        if (statusIndex === -1) throw new Error("Missing --status flag");
        const status = args[statusIndex + 1];
        const result = await adapter.updateTask(id, status);
        console.log(result.message);
        break;
      }
      case 'comment': {
        const id = args[0];
        const comment = args.slice(1).join(" ");
        if (!id || !comment) throw new Error("Missing task ID or comment");
        const result = await adapter.commentOnTask(id, comment);
        console.log(result.message);
        break;
      }
      case 'create': {
        const titleIndex = args.indexOf('--title');
        const descIndex = args.indexOf('--desc');
        if (titleIndex === -1 || descIndex === -1) {
           throw new Error("Missing --title or --desc flags");
        }
        const title = args[titleIndex + 1];
        const desc = args[descIndex + 1];
        const result = await adapter.createTask(title, desc);
        console.log(result.message);
        break;
      }
      default:
        console.log(`
Usage:
  node scripts/agile.js list [--status <status>]
  node scripts/agile.js take <id>
  node scripts/agile.js update <id> --status <status>
  node scripts/agile.js comment <id> <comment text>
  node scripts/agile.js create --title <title> --desc <desc>
        `);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

run();
