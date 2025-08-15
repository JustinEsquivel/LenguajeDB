import { makeRequest, normalizeRow, getAuthData } from '../utils.js';

const qs = new URLSearchParams(location.search);
const ID = Number(qs.get('id'));

const user = getAuthData();
const IS_ADMIN = !!(user && Number(user.rol) === 1);

document.addEventListener('DOMContentLoaded', async () => {
  if (!ID) { alert('Falta ?id'); return; }

  // Siempre carga la campaña (para objetivo, recaudado, progreso)
  const tasks = [cargarCampania()];
  // Solo admin carga las donaciones individuales
  if (IS_ADMIN) tasks.push(cargarDonaciones());

  await Promise.allSettled(tasks);

  // Donar (permite a cualquier logueado)
  wireDonar();

  // Asegura estado visual de la tarjeta por rol
  const card = document.getElementById('donacionesCard');
  if (card) card.classList.toggle('d-none', !IS_ADMIN);
});

/* ----------------- helpers de fecha y dinero ----------------- */
function toIso(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Acepta Date o string; devuelve YYYY-MM-DD si es posible
function fmtDate(v) {
  if (!v) return '';
  if (v instanceof Date && !isNaN(v)) return toIso(v);
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return isNaN(d) ? s.slice(0, 10) : toIso(d);
}

function money(n) { return Number(n || 0).toLocaleString(); }

/* ----------------- Carga de campaña ----------------- */
async function cargarCampania() {
  try {
    const c = normalizeRow(await makeRequest(`/campanas/${ID}`, 'GET'));

    const nombre = c.nombre || '-';
    const descripcion = c.descripcion || '-';
    const fIni = fmtDate(c.fechainicio || c.inicio);
    const fFin = fmtDate(c.fechafin || c.fin);

    document.getElementById('campaniaNombre')?.replaceChildren(document.createTextNode(nombre));
    document.getElementById('campaniaDescripcion')?.replaceChildren(document.createTextNode(descripcion));
    document.getElementById('campaniaFechas')?.replaceChildren(
      document.createTextNode(`${fIni || '-'} → ${fFin || '-'}`)
    );
    document.getElementById('objetivo')?.replaceChildren(document.createTextNode(money(c.objetivo || 0)));

    const tot = await totalRecaudado();
    document.getElementById('recaudado')?.replaceChildren(document.createTextNode(money(tot)));

    const objetivo = Number(c.objetivo || 0);
    const pct = objetivo > 0 ? Math.min(100, Math.floor((tot / objetivo) * 100)) : 0;

    const bar = document.getElementById('progress');
    if (bar) {
      bar.style.width = `${pct}%`;
      bar.textContent = `${pct}%`;
      bar.setAttribute('aria-valuenow', String(pct));
    }
  } catch (e) {
    console.error('Detalle campaña:', e);
  }
}

async function totalRecaudado() {
  try {
    const r = await makeRequest(`/campanas/${ID}/donaciones-total`, 'GET');
    return Number((r && (r.total ?? r.TOTAL)) || 0);
  } catch {
    // fallback: si no hay endpoint de total, suma en cliente (pero solo si admin para no pedir la lista a público)
    if (!IS_ADMIN) return 0;
    try {
      const list = await makeRequest(`/campanas/${ID}/donaciones`, 'GET');
      return list.reduce((acc, it) => acc + Number(it.cantidad || it.CANTIDAD || 0), 0);
    } catch { return 0; }
  }
}

/* ----------------- Tabla de donaciones (solo admin) ----------------- */
async function cargarDonaciones() {
  if (!IS_ADMIN) return; // seguridad extra

  const tbody = document.getElementById('donacionesBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  try {
    const rows = await makeRequest(`/campanas/${ID}/donaciones`, 'GET');

    if (!Array.isArray(rows) || rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aún no hay donaciones</td></tr>`;
      return;
    }

    rows.forEach(d => {
      const r = normalizeRow(d);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fmtDate(r.fecha)}</td>
        <td class="text-end">${money(r.cantidad || 0)}</td>
        <td>${r.usuario_nombre ? `${r.usuario_nombre} <small class="text-muted">#${r.usuario}</small>` : (r.usuario ?? '-')}</td>
        <td>${r.id}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('Donaciones:', e);
  }
}

/* ----------------- Envío de donación ----------------- */
function wireDonar() {
  const form = document.getElementById('donarForm');
  if (!form) return;

  // valores por defecto
  const f = document.getElementById('donarFecha');
  if (f && !f.value) f.value = toIso(new Date());

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const u = getAuthData();
    if (!u) return alert('Debes iniciar sesión para donar');

    const fecha = (document.getElementById('donarFecha')?.value || '').trim(); // YYYY-MM-DD
    const monto = Number((document.getElementById('donarMonto')?.value || '0').replace(',', '.'));

    if (!fecha) return alert('La fecha es obligatoria');
    if (!(monto > 0)) return alert('El monto debe ser mayor a 0');

    const btn = form.querySelector('button[type="submit"]');
    try {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      await makeRequest('/donaciones', 'POST', {
        fecha,                 // 'YYYY-MM-DD'
        cantidad: monto,
        usuario: Number(u.id),
        campana: ID
      });

      // refrescar totales y (si admin) la tabla
      await Promise.allSettled([
        cargarCampania(),
        IS_ADMIN ? cargarDonaciones() : Promise.resolve()
      ]);
      form.reset();
      if (f) f.value = toIso(new Date());

      alert('¡Gracias por tu aporte! 💚');
    } catch (e) {
      alert(e.message || 'No fue posible registrar la donación');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Donar';
    }
  });
}
