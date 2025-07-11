const API_BASE = '';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

export const api = {
  async getTasks() {
    const response = await fetch(`${API_BASE}/api/tasks`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createTask(task) {
    const response = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(task)
    });
    return response.json();
  },

  async updateTask(task) {
    const response = await fetch(`${API_BASE}/api/tasks`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(task)
    });
    return response.json();
  },

  async deleteTask(id) {
    const response = await fetch(`${API_BASE}/api/tasks?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};