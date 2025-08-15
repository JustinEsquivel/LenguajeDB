// /js/index.js
import { makeRequest } from '/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Cargar contadores en paralelo (silencioso ante errores)
  Promise.allSettled([
    loadMascotasCount(),
    loadAdopcionesCount(),
    loadCampanasCount(),
    loadVoluntariosCount()
  ]);
});

function setNum(id, n) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(Number.isFinite(n) ? n : 0);
}

async function tryFirst(endpoints = []) {
  for (const ep of endpoints) {
    try {
      const r = await makeRequest(ep, 'GET');
      return r;
    } catch (_) { /* intenta el siguiente */ }
  }
  throw new Error('Sin endpoints válidos');
}

/* ---- Mascotas ---- */
async function loadMascotasCount() {
  try {
    // 1) endpoint de conteo si existe; 2) lista completa y contamos; 3) fallback sin /api
    const data =
      (await tryFirst(['/api/mascotas-count'])) ??
      (await tryFirst(['/api/mascotas', '/mascotas']));
    const total =
      typeof data?.total === 'number'
        ? data.total
        : Array.isArray(data) ? data.length : 0;
    setNum('mascotasCount', total);
  } catch {
    setNum('mascotasCount', 0);
  }
}

/* ---- Adopciones ---- */
async function loadAdopcionesCount() {
  try {
    const data =
      (await tryFirst(['/api/adopciones-count'])) ??
      (await tryFirst(['/api/adopciones', '/adopciones']));
    const total =
      typeof data?.total === 'number'
        ? data.total
        : Array.isArray(data) ? data.length : 0;
    setNum('adopcionesCount', total);
  } catch {
    setNum('adopcionesCount', 0);
  }
}

/* ---- Campañas activas ---- */
async function loadCampanasCount() {
  try {
    const rows = await tryFirst(['/api/campanas-activas', '/campanas-activas']);
    const total = Array.isArray(rows) ? rows.length : 0;
    setNum('campanasCount', total);
  } catch {
    setNum('campanasCount', 0);
  }
}

/* ---- Voluntarios (activos) ---- */
async function loadVoluntariosCount() {
  try {
    // Intenta endpoints típicos; ajusta si tu backend usa otros
    const data =
      (await tryFirst(['/api/usuarios-activos-count'])) ??
      (await tryFirst([
        '/api/usuarios-activos',
        '/api/usuarios?estado=Activo',
        '/api/usuarios'
      ]));
    const total =
      typeof data?.total === 'number'
        ? data.total
        : Array.isArray(data) ? data.length : 0;
    setNum('voluntariosCount', total);
  } catch {
    setNum('voluntariosCount', 0);
  }
}
