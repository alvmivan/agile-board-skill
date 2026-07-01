import fs from 'fs';
import path from 'path';
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

    this.config = null;
    try {
      const configPath = path.resolve(process.cwd(), 'config.json');
      if (fs.existsSync(configPath)) {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (e) {
      // Silently ignore configuration load errors unless explicitly in projects mode
    }
  }

  get isProjectMode() {
    return this.config && this.config.projectNumber !== undefined;
  }

  _runGh(command) {
    try {
      return execSync(`gh ${command}`, { encoding: 'utf-8' }).trim();
    } catch (error) {
      throw new Error(`Command failed: gh ${command}\n${error.message}`);
    }
  }

  _getOptionId(status) {
    if (!status || !this.config || !this.config.statusMap) return null;
    const normalized = status.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, val] of Object.entries(this.config.statusMap)) {
      if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized) {
        return val;
      }
    }
    return null;
  }

  _findProjectItemId(issueId) {
    if (!this.config.projectNumber || !this.config.repoOwner) {
      throw new Error("Missing projectNumber or repoOwner in config.json.");
    }
    const output = this._runGh(`project item-list ${this.config.projectNumber} --owner ${this.config.repoOwner} --format json`);
    const data = JSON.parse(output || '{"items":[]}');
    const items = data.items || [];
    const item = items.find(i => i.content && String(i.content.number) === String(issueId));
    if (!item) {
      throw new Error(`Task with ID ${issueId} not found in project ${this.config.projectNumber}`);
    }
    return item.id;
  }

  async listTasks(status) {
    if (this.isProjectMode) {
      const output = this._runGh(`project item-list ${this.config.projectNumber} --owner ${this.config.repoOwner} --format json`);
      const data = JSON.parse(output || '{"items":[]}');
      const items = data.items || [];
      
      let tasks = items.map(item => ({
        id: item.content && item.content.number ? item.content.number : item.id,
        title: item.title || (item.content && item.content.title) || 'Untitled',
        status: item.status,
        assignee: item.assignees && item.assignees.length > 0 ? item.assignees[0] : 'Unassigned'
      }));

      if (status) {
        const targetStatus = status.toLowerCase().replace(/[^a-z0-9]/g, '');
        tasks = tasks.filter(task => {
          if (!task.status) return false;
          return task.status.toLowerCase().replace(/[^a-z0-9]/g, '') === targetStatus;
        });
      }
      return tasks;
    } else {
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
  }

  async takeTask(id) {
    if (this.isProjectMode) {
      const repoFlag = this.config.repoOwner && this.config.repoName ? `--repo ${this.config.repoOwner}/${this.config.repoName}` : '';
      this._runGh(`issue edit ${id} ${repoFlag} --add-assignee "@me"`);
      
      const itemId = this._findProjectItemId(id);
      const optionId = this._getOptionId("In Progress");
      if (optionId) {
        this._runGh(`project item-edit --id "${itemId}" --field-id "${this.config.fieldId}" --project-id "${this.config.projectId}" --single-select-option-id "${optionId}"`);
      } else {
        throw new Error("Could not find status option ID for 'In Progress' in statusMap");
      }
      return { success: true, message: `Ticket ${id} assigned and moved to In Progress in Project ${this.config.projectNumber}.` };
    } else {
      this._runGh(`issue edit ${id} --add-assignee "@me" --add-label "In Progress" --remove-label "To Do"`);
      return { success: true, message: `Ticket ${id} assigned and moved to In Progress.` };
    }
  }

  async updateTask(id, status) {
    if (this.isProjectMode) {
      const itemId = this._findProjectItemId(id);
      const optionId = this._getOptionId(status);
      if (!optionId) {
        throw new Error(`Could not find status option ID for '${status}' in statusMap`);
      }
      this._runGh(`project item-edit --id "${itemId}" --field-id "${this.config.fieldId}" --project-id "${this.config.projectId}" --single-select-option-id "${optionId}"`);
      return { success: true, message: `Ticket ${id} status updated to ${status} in Project ${this.config.projectNumber}.` };
    } else {
      this._runGh(`issue edit ${id} --add-label "${status}"`);
      return { success: true, message: `Ticket ${id} status updated to ${status}.` };
    }
  }

  async commentOnTask(id, comment) {
    const repoFlag = this.isProjectMode && this.config.repoOwner && this.config.repoName ? `--repo ${this.config.repoOwner}/${this.config.repoName}` : '';
    this._runGh(`issue comment ${id} ${repoFlag} --body "${comment}"`);
    return { success: true, message: `Comment added to ticket ${id}.` };
  }

  async createTask(title, description, status = 'To Do') {
    if (this.isProjectMode) {
      const repoFlag = this.config.repoOwner && this.config.repoName ? `--repo ${this.config.repoOwner}/${this.config.repoName}` : '';
      const output = this._runGh(`issue create ${repoFlag} --title "${title}" --body "${description}"`);
      const urlMatch = output.match(/(https:\/\/github\.com\/\S+\/issues\/(\d+))/);
      if (!urlMatch) {
        throw new Error(`Could not parse issue URL from output: ${output}`);
      }
      const issueUrl = urlMatch[1];
      const id = urlMatch[2];

      const addOutput = this._runGh(`project item-add ${this.config.projectNumber} --owner ${this.config.repoOwner} --url "${issueUrl}" --format json`);
      const addedItem = JSON.parse(addOutput || '{}');
      const itemId = addedItem.id;

      if (itemId && status) {
        const optionId = this._getOptionId(status);
        if (optionId) {
          this._runGh(`project item-edit --id "${itemId}" --field-id "${this.config.fieldId}" --project-id "${this.config.projectId}" --single-select-option-id "${optionId}"`);
        }
      }

      return { success: true, id, message: `Created ticket ${id} and added to project ${this.config.projectNumber}.` };
    } else {
      const output = this._runGh(`issue create --title "${title}" --body "${description}" --label "${status}"`);
      const match = output.match(/issues\/(\d+)/);
      const id = match ? match[1] : 'unknown';
      return { success: true, id, message: `Created ticket ${id}.` };
    }
  }
}
