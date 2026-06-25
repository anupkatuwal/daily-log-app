const h = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function apiFetch(path, opts = {}) {
  const r = await fetch(path, opts);
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    const err = new Error(body.detail || r.statusText);
    err.status = r.status;
    throw err;
  }
  return r.status === 204 ? null : r.json();
}

export const register = (username, pin) =>
  apiFetch('/api/auth/register', { method: 'POST', headers: h(), body: JSON.stringify({ username, pin }) });

export const login = (username, pin) =>
  apiFetch('/api/auth/login', { method: 'POST', headers: h(), body: JSON.stringify({ username, pin }) });

export const listLogs = (token) =>
  apiFetch('/api/logs', { headers: h(token) });

export const getLog = (token, date) =>
  apiFetch(`/api/logs/${date}`, { headers: h(token) });

export const deleteLog = (token, date) =>
  apiFetch(`/api/logs/${date}`, { method: 'DELETE', headers: h(token) });

export async function upsertLog(token, payload) {
  try {
    return await apiFetch('/api/logs', { method: 'POST', headers: h(token), body: JSON.stringify(payload) });
  } catch (err) {
    if (err.status === 409) {
      return apiFetch(`/api/logs/${payload.log_date}`, { method: 'PUT', headers: h(token), body: JSON.stringify(payload) });
    }
    throw err;
  }
}

export const estimateMacros = (token, foodDescription) =>
  apiFetch('/api/estimate-macros', { method: 'POST', headers: h(token), body: JSON.stringify({ food_description: foodDescription }) });
