
import { makeRequest } from '/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
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
    } catch (_) {  }
  }
  throw new Error('Sin endpoints válidos');
}

async function loadMascotasCount() {
  try {
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

async function loadCampanasCount() {
  try {
    const rows = await tryFirst(['/api/campanas-activas', '/campanas-activas']);
    const total = Array.isArray(rows) ? rows.length : 0;
    setNum('campanasCount', total);
  } catch {
    setNum('campanasCount', 0);
  }
}

async function loadVoluntariosCount() {
  try {
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
