const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('vira_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (err) {
    throw new Error('Network error — is the server running?');
  }

  // Safely parse JSON — handle empty or non-JSON responses
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server returned invalid response (status ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

// ── Auth ──
export const authAPI = {
  login:    (body) => request('/auth/login',    { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me:       ()     => request('/auth/me'),
};

// ── Tasks ──
export const taskAPI = {
  list:   (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/tasks${query}`);
  },
  get:    (id)          => request(`/tasks/${id}`),
  create: (body)        => request('/tasks',        { method: 'POST', body }),
  update: (id, body)    => request(`/tasks/${id}`,  { method: 'PUT',  body }),
  delete: (id)          => request(`/tasks/${id}`,  { method: 'DELETE' }),
};

// ── Volunteers ──
export const volunteerAPI = {
  list:          ()     => request('/volunteers'),
  get:           (id)   => request(`/volunteers/${id}`),
  updateProfile: (body) => request('/volunteers/profile', { method: 'PUT', body }),
  notifications: ()     => request('/volunteers/notifications/me'),
};

// ── Assignments ──
export const assignAPI = {
  assign:  (body)    => request('/assign-task',             { method: 'POST', body }),
  match:   (taskId)  => request(`/assign-task/match/${taskId}`),
};

// ── Data ──
export const dataAPI = {
  upload:    (body) => request('/data/upload',  { method: 'POST', body }),
  reports:   (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/data/reports${query}`);
  },
  analytics: ()     => request('/data/analytics'),
};
