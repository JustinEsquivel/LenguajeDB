import { makeRequest } from './utils.js';

const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

async function safeCount(getter) {
  try { return await getter(); } catch { return 0; }
}

async function countMascotas() {
  const list = await makeRequest('/mascotas'); // GET all
  return Array.isArray(list) ? list.length : 0;
}

async function countAdopciones() {
  const list = await makeRequest('/adopciones').catch(() => []);
  return Array.isArray(list) ? list.length : 0;
}

async function countVoluntariosActivos() {
  const list = await makeRequest('/voluntarios').catch(() => []);
  if (!Array.isArray(list)) return 0;
  return list.filter(v => (v.estado ?? v.ESTADO) === 'Activo').length;
}

async function countCampanasActivas() {
  const list = await makeRequest('/campanas').catch(() => []);
  if (!Array.isArray(list)) return 0;
  return list.filter(c => (c.estado ?? c.ESTADO) === 'Activa').length;
}

(async () => {
  const [
    totMascotas,
    totAdop,
    totVol,
    totCamp
  ] = await Promise.all([
    safeCount(countMascotas),
    safeCount(countAdopciones),
    safeCount(countVoluntariosActivos),
    safeCount(countCampanasActivas)
  ]);

  setText('kpiMascotas', totMascotas);
  setText('kpiAdopciones', totAdop);
  setText('kpiVoluntarios', totVol);
  setText('kpiCampanas', totCamp);
})();
