const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || JSON.stringify(err));
  }
  if (res.status === 204) return;
  return res.json();
}

export const authApi = {
  login: (email, password) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password, full_name) =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    }),
};

export const orgsApi = {
  list: () => api('/organizations'),
  create: (name, slug) =>
    api('/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    }),
};

export const projectsApi = {
  list: (orgId) => api(`/organizations/${orgId}/projects`),
  get: (orgId, projectId) => api(`/organizations/${orgId}/projects/${projectId}`),
  create: (orgId, name, description) =>
    api(`/organizations/${orgId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ name, description: description || null }),
    }),
  update: (orgId, projectId, data) =>
    api(`/organizations/${orgId}/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (orgId, projectId) =>
    api(`/organizations/${orgId}/projects/${projectId}`, { method: 'DELETE' }),
};

export const tasksApi = {
  list: (orgId, projectId) =>
    api(`/organizations/${orgId}/projects/${projectId}/tasks`),
  create: (orgId, projectId, data) =>
    api(`/organizations/${orgId}/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (orgId, projectId, taskId, data) =>
    api(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (orgId, projectId, taskId) =>
    api(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};
