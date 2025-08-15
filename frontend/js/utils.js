// frontend/js/utils.js  (ES Module)
const API_BASE = 'http://localhost:5000';

/* =======================
   URL builder
======================= */
function buildUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;                 // absoluta
  if (url.startsWith('/auth') || url.startsWith('/api')) {
    return `${API_BASE}${url}`;                              // respeta prefijo
  }
  return `${API_BASE}/api${url}`;                            // por defecto a /api
}

/* =======================
   Auth helpers (Storage)
======================= */
export function saveAuthData(user, token = null) {
  localStorage.setItem('user', JSON.stringify(user));
  if (token) localStorage.setItem('token', token);
}

export function getAuthData() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function getAuthToken() {
  return localStorage.getItem('token');
}

export function getUserRole() {
  try {
    const u = getAuthData();
    return (u && typeof u.rol !== 'undefined') ? Number(u.rol) : null;
  } catch { return null; }
}

export function getUserId() {
  try {
    const u = getAuthData();
    return (u && typeof u.id !== 'undefined') ? String(u.id) : '';
  } catch { return ''; }
}

export function clearAuthData() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

/* =======================
   Fetch wrapper
======================= */
export async function makeRequest(url, method = 'GET', data = null, isFormData = false) {
  const options = { method, headers: {} };

  // Content-Type solo si no es FormData
  if (!isFormData && !(data instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  // Token (si existe)
  const token = getAuthToken();
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  // ⬇️ Añade rol e id de usuario para que el backend sepa si es admin
  const role = getUserRole();
  if (role !== null) options.headers['X-ROLE'] = String(role);

  const uid = getUserId();
  if (uid) options.headers['X-USER-ID'] = uid;

  // Body
  if (data) {
    options.body = (isFormData || data instanceof FormData) ? data : JSON.stringify(data);
  }

  const fullUrl = buildUrl(url);
  const res = await fetch(fullUrl, options);

  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch { err = {}; }
    const msg = err.error || err.message || `Error ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

/* =======================
   UI helpers (opcionales)
======================= */
export function showError(message, el) {
  if (el) {
    el.textContent = message;
    el.classList.remove('d-none');
    el.classList.add('text-danger');
  } else {
    alert(`ERROR: ${message}`);
  }
}

export function showSuccess(message, el) {
  if (el) {
    el.textContent = message;
    el.classList.remove('d-none', 'text-danger');
    el.classList.add('text-success');
  } else {
    alert(message);
  }
}

/**
 * Normaliza un objeto con claves mayúsculas/minúsculas a lower-case.
 */
export function normalizeRow(row = {}) {
  const out = {};
  Object.keys(row).forEach(k => out[k.toLowerCase()] = row[k]);
  return out;
}
// === Normaliza un arreglo de filas (usa normalizeRow) ===
export function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeRow);
}

// === Alerta simple (fallback a alert si no tienes contenedor) ===
export function showAlert(message, type = 'info', containerId = 'globalAlerts') {
  const host = document.getElementById(containerId);
  if (!host) {
    // Sin contenedor visual -> usa alert del navegador
    alert(message);
    return;
  }
  host.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}
// --- al final de utils.js (o donde tengas helpers de UI) ---
export function formatDate(value, locale = 'es-CR') {
  if (!value) return '';
  try {
    // si ya viene como 'YYYY-MM-DD...' corta la parte de fecha
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [y, m, d] = value.slice(0,10).split('-').map(Number);
      // usar UTC evita desfasajes por zona horaria
      return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale);
    }
    // si viene como Date o ISO completo, deja que el navegador lo formatee
    const dt = (value instanceof Date) ? value : new Date(value);
    return dt.toLocaleDateString(locale);
  } catch {
    // último recurso: muestra solo YYYY-MM-DD
    return String(value).slice(0,10);
  }
}


