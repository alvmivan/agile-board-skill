import { execSync } from 'child_process';
import { AgileAdapter } from './interface.js';

export class GithubAdapter extends AgileAdapter {
  constructor() {
    super();
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch (e) {
      throw new Error("GitHub CLI (gh) is not installed or not in PATH.");
    }
  }

  _runGh(command) {
    try {
      return execSync(`gh ${command}`, { encoding: 'utf-8' }).trim();
    } catch (error) {
      throw new Error(`Command failed: gh ${command}\n${error.message}`);
    }
  }

  async listTasks(status) {
    const labelArg = status ? `--label "${status}"` : '';
    const output = this._runGh(`issue list ${labelArg} --json number,title,state,assignees`);
    const issues = JSON.parse(output || '[]');
    
    return issues.map(issue => ({
      id: issue.number,
      title: issue.title,
      status: issue.state,
      assignee: issue.assignees.length > 0 ? issue.assignees[0].login : 'Unassigned'
    }));
  }

  async takeTask(id) {
    this._runGh(`issue edit ${id} --add-assignee "@me" --add-label "In Progress" --remove-label "To Do"`);
    return { success: true, message: `Ticket ${id} assigned and moved to In Progress.` };
  }

  async updateTask(id, status) {
    this._runGh(`issue edit ${id} --add-label "${status}"`);
    return { success: true, message: `Ticket ${id} status updated to ${status}.` };
  }

  async commentOnTask(id, comment) {
    this._runGh(`issue comment ${id} --body "${comment}"`);
    return { success: true, message: `Comment added to ticket ${id}.` };
  }

  async createTask(title, description, status = 'To Do') {
    const output = this._runGh(`issue create --title "${title}" --body "${description}" --label "${status}"`);
    const match = output.match(/issues\/(\d+)/);
    const id = match ? match[1] : 'unknown';
    return { success: true, id, message: `Created ticket ${id}.` };
  }
}
