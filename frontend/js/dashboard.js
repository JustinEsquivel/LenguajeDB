// /js/dashboard.js
import { makeRequest, normalizeRow } from '/js/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Ejecuta todo en paralelo, pero cada bloque maneja sus propios errores
  Promise.allSettled([
    loadKpis(),
    loadMascotasRecientes(),
    loadAdopcionesRecientes(),
    loadCampanasKpiYTabla(),
    loadReportesRecientes(),
    loadTotalRecaudado()
  ]);
});

/* ========================
 * Utilidades
 * ======================*/
function esc(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function safeNum(n) { const x = Number(n || 0); return Number.isFinite(x) ? x : 0; }
function pct(part, total) {
  const p = total > 0 ? Math.floor((safeNum(part) / safeNum(total)) * 100) : 0;
  return Math.max(0, Math.min(100, p));
}
async function tryFirst(endpoints = []) {
  for (const ep of endpoints) {
    try {
      const r = await makeRequest(ep, 'GET');
      return r;
    } catch (_) { /* siguiente */ }
  }
  throw new Error('Sin endpoints válidos');
}

/* ========================
 * KPIs
 * ======================*/
async function loadKpis() {
  try {
    // Mascotas (total)
    let mascotas = await tryFirst(['/api/mascotas', '/mascotas']);
    if (!Array.isArray(mascotas)) mascotas = [];
    // Disponibles (endpoint público si existe)
    let disponibles = [];
    try {
      disponibles = await tryFirst(['/api/mascotas-disponibles', '/mascotas-disponibles']);
      if (!Array.isArray(disponibles)) disponibles = [];
    } catch {
      // fallback: filtra por estado
      disponibles = mascotas.filter(m => (normalizeRow(m).estado || '').toLowerCase() === 'disponible');
    }
    // Adoptadas (por estado en el objeto mascota)
    const adoptadas = mascotas.filter(m => (normalizeRow(m).estado || '').toLowerCase() === 'adoptado');

    // Observación / Tratamiento (si tu backend maneja estos estados en mascota)
    const obs = mascotas.filter(m => (normalizeRow(m).estado || '').toLowerCase() === 'en observación');
    const trt = mascotas.filter(m => (normalizeRow(m).estado || '').toLowerCase() === 'en tratamiento');

    // Adopciones (conteo)
    let adopciones = 0;
    try {
      const adops = await tryFirst(['/api/adopciones', '/adopciones']);
      adopciones = Array.isArray(adops) ? adops.length : (Number(adops?.total) || 0);
    } catch { adopciones = 0; }

    // Campañas activas (conteo)
    let campanas = 0;
    try {
      const rows = await tryFirst(['/api/campanas-activas', '/campanas-activas']);
      campanas = Array.isArray(rows) ? rows.length : 0;
    } catch { campanas = 0; }

    // Reportes (si no tienes endpoint aún, queda 0)
    let reportes = 0;
    try {
      const rep = await tryFirst(['/api/reportes', '/reportes']);
      reportes = Array.isArray(rep) ? rep.length : (Number(rep?.total) || 0);
    } catch { reportes = 0; }

    // Pintar
    setNum('kpiTotMascotas', mascotas.length);
    setNum('kpiDisponibles', disponibles.length);
    setNum('kpiAdoptadas', adoptadas.length);
    setNum('kpiObservacion', obs.length);
    setNum('kpiTratamiento', trt.length);
    setNum('kpiAdopciones', adopciones);
    setNum('kpiCampanas', campanas);
    setNum('kpiReportes', reportes);

  } catch (e) {
    // En caso de error general, evita dejar KPIs vacíos
    ['kpiTotMascotas', 'kpiDisponibles', 'kpiAdoptadas', 'kpiObservacion',
      'kpiTratamiento', 'kpiAdopciones', 'kpiCampanas', 'kpiReportes']
      .forEach(id => setNum(id, 0));
    console.error('Error KPIs:', e);
  }
}

function setNum(id, n) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(Number.isFinite(n) ? n : 0);
}

/* ========================
 * Mascotas recientes
 * ======================*/
async function loadMascotasRecientes() {
  try {
    let rows = await tryFirst(['/api/mascotas', '/mascotas']);
    if (!Array.isArray(rows)) rows = [];
    // Ordenar por id desc (si no hay fecha de creación disponible)
    rows = rows.map(normalizeRow)
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
      .slice(0, 5);

    const tbody = document.getElementById('tbMascotasRec');
    if (!tbody) return;

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Sin registros</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(m => {
      const estadoBadge = (m.estado || '').toLowerCase() === 'disponible'
        ? 'bg-success' : 'bg-secondary';
      return `
        <tr>
          <td>${esc(m.nombre || '-')}</td>
          <td>${esc(m.raza || '-')}</td>
          <td><span class="badge ${estadoBadge}">${esc(m.estado || '-')}</span></td>
        </tr>`;
    }).join('');
  } catch (e) {
    console.error('Mascotas recientes:', e);
    const tbody = document.getElementById('tbMascotasRec');
    if (tbody) tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Error al cargar</td></tr>`;
  }
}

/* ========================
 * Adopciones recientes
 * ======================*/
const _userCache = new Map();
const _petCache = new Map();

async function resolveUserName(id) {
  if (!id) return '-';
  if (_userCache.has(id)) return _userCache.get(id);
  try {
    const row = await tryFirst([`/api/usuarios/${id}`, `/usuarios/${id}`]);
    const u = normalizeRow(row || {});
    const name = u.nombre || u.email || `Usuario #${id}`;
    _userCache.set(id, name);
    return name;
  } catch {
    const name = `Usuario #${id}`;
    _userCache.set(id, name);
    return name;
  }
}
async function resolvePetName(id) {
  if (!id) return '-';
  if (_petCache.has(id)) return _petCache.get(id);
  try {
    const row = await tryFirst([`/api/mascotas/${id}`, `/mascotas/${id}`]);
    const m = normalizeRow(row || {});
    const name = m.nombre || `Mascota #${id}`;
    _petCache.set(id, name);
    return name;
  } catch {
    const name = `Mascota #${id}`;
    _petCache.set(id, name);
    return name;
  }
}

async function loadAdopcionesRecientes() {
  try {
    let rows = await tryFirst(['/api/adopciones', '/adopciones']);
    if (!Array.isArray(rows)) rows = [];
    const items = rows.map(normalizeRow)
      .sort((a, b) => {
        const da = new Date(a.fecha || a.FECHA || 0);
        const db = new Date(b.fecha || b.FECHA || 0);
        return db - da;
      })
      .slice(0, 5);

    const tbody = document.getElementById('tbAdopRec');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Sin registros</td></tr>`;
      return;
    }

    // Resolver nombres (usuario y mascota) en paralelo por fila
    const resolved = await Promise.all(items.map(async (a) => {
      const [userName, petName] = await Promise.all([
        resolveUserName(a.usuario || a.USUARIO),
        resolvePetName(a.mascota || a.MASCOTA)
      ]);
      const f = a.fecha || a.FECHA;
      const fTxt = f ? new Date(f).toLocaleDateString() : '-';
      return { fTxt, userName, petName };
    }));

    tbody.innerHTML = resolved.map(r => `
      <tr>
        <td>${esc(r.fTxt)}</td>
        <td>${esc(r.userName)}</td>
        <td>${esc(r.petName)}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Adopciones recientes:', e);
    const tbody = document.getElementById('tbAdopRec');
    if (tbody) tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Error al cargar</td></tr>`;
  }
}

/* ========================
 * Campañas activas (KPI + Top 5)
 * ======================*/
async function loadCampanasKpiYTabla() {
  try {
    const rows = await tryFirst(['/api/campanas-activas', '/campanas-activas']);
    const list = Array.isArray(rows) ? rows.map(normalizeRow) : [];

    // KPI #campanas
    const kpi = document.getElementById('kpiCampanas');
    if (kpi) kpi.textContent = String(list.length);

    const lbl = document.getElementById('lblCampanasKpi');
    if (lbl) lbl.textContent = `${list.length} activas`;

    // Orden por fin más próximo (el backend ya ordena; reforzamos)
    list.sort((a, b) => {
      const fa = new Date((a.fechafin || a.fin || '')?.toString().slice(0, 10));
      const fb = new Date((b.fechafin || b.fin || '')?.toString().slice(0, 10));
      return fa - fb;
    });

    // Top 5
    const top = list.slice(0, 5);
    const tbody = document.getElementById('tbCampanasRec');
    if (!tbody) return;

    if (top.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay campañas activas</td></tr>`;
      return;
    }

    tbody.innerHTML = top.map(c => {
      const rec = safeNum(c.recaudado);
      const obj = safeNum(c.objetivo);
      const p = pct(rec, obj);
      const fin = (c.fechafin || c.fin || '').toString().slice(0, 10) || '-';

      return `
        <tr>
          <td>${esc(c.nombre || '-')}</td>
          <td style="min-width:180px">
            <div class="progress" title="${p}%">
              <div class="progress-bar" role="progressbar" style="width:${p}%"
                   aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </td>
          <td class="text-end">${rec.toLocaleString()} / ${obj.toLocaleString()}</td>
          <td>${esc(fin)}</td>
        </tr>`;
    }).join('');
  } catch (e) {
    console.error('Campañas dashboard:', e);
    const kpi = document.getElementById('kpiCampanas');
    if (kpi) kpi.textContent = '0';
    const tbody = document.getElementById('tbCampanasRec');
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Error cargando campañas</td></tr>`;
  }
}
/* ========================
 * Reportes recientes
 * ======================*/
async function loadReportesRecientes() {
  try {
    let rows = await tryFirst(['/api/reportes', '/reportes']);
    if (!Array.isArray(rows)) rows = [];

    // Orden: más nuevos primero por fecha (fallback a id)
    rows = rows.map(normalizeRow)
      .sort((a, b) => {
        const da = new Date(a.fecha || a.FECHA || 0);
        const db = new Date(b.fecha || b.FECHA || 0);
        const diff = db - da;
        if (diff !== 0) return diff;
        return Number(b.id || 0) - Number(a.id || 0);
      })
      .slice(0, 5);

    const tbody = document.getElementById('tbReportesRec');
    if (!tbody) return;

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Sin registros</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(r => {
      const f = r.fecha || r.FECHA;
      const fTxt = f ? new Date(f).toLocaleDateString() : '-';
      const ubic = [r.provincia || r.PROVINCIA, r.canton || r.CANTON, r.distrito || r.DISTRITO]
        .filter(Boolean).join(', ');
      const usuario = r.usuario ?? r.USUARIO ?? '-';
      const id = r.id ?? r.ID;

      return `
        <tr>
          <td>${esc(fTxt)}</td>
          <td>${esc(ubic || '-')}</td>
          <td>${esc(String(usuario))}</td>
          <td class="text-end">
            <a class="btn btn-sm btn-outline-primary"
               href="/pages/reportes/detalle-reporte.html?id=${encodeURIComponent(id)}">
              Ver
            </a>
          </td>
        </tr>`;
    }).join('');
  } catch (e) {
    console.error('Reportes recientes:', e);
    const tbody = document.getElementById('tbReportesRec');
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Error al cargar</td></tr>`;
  }
}
async function loadTotalRecaudado() {
  try {
    let rows = await tryFirst([
      '/api/campanas', '/campanas',
      '/api/campanas-activas', '/campanas-activas'
    ]);
    const list = Array.isArray(rows) ? rows.map(normalizeRow) : [];
    const total = list.reduce((acc, c) => acc + safeNum(c.recaudado), 0);

    renderMoney('kpiTotalRecaudado', total, 'es-CR', 'CRC'); // ⬅️ aquí
  } catch (e) {
    console.error('Total recaudado:', e);
    renderMoney('kpiTotalRecaudado', 0, 'es-CR', 'CRC');
  }
}

function renderMoney(elId, amount, locale='es-CR', currency='CRC') {
  const el = document.getElementById(elId);
  if (!el) return;

  const parts = new Intl.NumberFormat(locale, { style:'currency', currency }).formatToParts(Number(amount||0));
  const symbol  = parts.find(p => p.type === 'currency')?.value ?? '';
  const integer = parts.filter(p => p.type === 'integer' || p.type === 'group').map(p => p.value).join('');
  const fraction= parts.find(p => p.type === 'fraction')?.value; // puede venir vacío según configuración

  el.innerHTML = `
    <span class="symbol">${symbol}</span>
    <span class="integer">${integer}</span>
    ${fraction != null ? `<span class="decimal">,${fraction}</span>` : ''}`;
}


