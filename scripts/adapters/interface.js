export class AgileAdapter {
  constructor() {
    if (this.constructor === AgileAdapter) {
      throw new Error("AgileAdapter is an abstract class");
    }
  }
  
  async listTasks(status) { throw new Error("Not implemented"); }
  async takeTask(id) { throw new Error("Not implemented"); }
  async updateTask(id, status) { throw new Error("Not implemented"); }
  async commentOnTask(id, comment) { throw new Error("Not implemented"); }
  async createTask(title, description, status) { throw new Error("Not implemented"); }
}
