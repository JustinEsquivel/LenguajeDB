import { makeRequest, getAuthData, getUserRole, normalizeRow } from '../utils.js';

const qs = new URLSearchParams(location.search);
const CAMPANA_ID = Number(qs.get('campana') || qs.get('id'));

const isAdmin = () => Number(getUserRole()) === 1;

document.addEventListener('DOMContentLoaded', () => {
  if (!CAMPANA_ID) {
    alert('Falta el parámetro de campaña (?campana o ?id)');
    return;
  }


  cargarCabeceraCampana();
  cargarDonaciones();
  wireAltaRapida();
});

function toIsoDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function fmtMoney(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

async function cargarCabeceraCampana() {
  try {
    const camp = await makeRequest(`/campanas/${CAMPANA_ID}`, 'GET');
    const c = normalizeRow(camp);
    document.getElementById('campaniaTitle')?.replaceChildren(document.createTextNode(c.nombre || `Campaña ${CAMPANA_ID}`));
    document.getElementById('objetivoCamp')?.replaceChildren(document.createTextNode(fmtMoney(c.objetivo || 0)));

    // total
    const tot = await tryTotalRecaudado();
    document.getElementById('totalRecaudado')?.replaceChildren(document.createTextNode(fmtMoney(tot)));

    const pct = c.objetivo ? Math.min(100, Math.floor((Number(tot)/Number(c.objetivo))*100)) : 0;
    const bar = document.getElementById('progressBar');
    if (bar) {
      bar.style.width = `${pct}%`;
      bar.setAttribute('aria-valuenow', String(pct));
      bar.textContent = `${pct}%`;
    }
  } catch (e) {
    console.warn('Cabecera campaña:', e.message);
  }
}

async function tryTotalRecaudado() {
  try {
    const r = await makeRequest(`/campanas/${CAMPANA_ID}/donaciones-total`, 'GET');
    return Number((r && (r.total ?? r.TOTAL)) || 0);
  } catch {
    // fallback: sumar desde listado
    try {
      const rows = await makeRequest(`/campanas/${CAMPANA_ID}/donaciones`, 'GET');
      return rows.reduce((acc, it) => acc + Number((it.cantidad ?? it.CANTIDAD) || 0), 0);
    } catch { return 0; }
  }
}

async function cargarDonaciones() {
  const tbody = document.getElementById('donacionesTbody');
  const noRows = document.getElementById('noResults');
  if (tbody) tbody.innerHTML = '';
  noRows?.classList.add('d-none');

  try {
    const data = await makeRequest(`/campanas/${CAMPANA_ID}/donaciones`, 'GET');
    if (!Array.isArray(data) || data.length === 0) {
      noRows?.classList.remove('d-none');
      return;
    }

    data.forEach(d => {
      const r = normalizeRow(d);
      const id        = r.id;
      const fecha     = (r.fecha || '').toString().slice(0,10);
      const cantidad  = Number(r.cantidad || 0);
      const usuarioId = r.usuario ?? r.usuario_id ?? '-';
      const usuarioNm = r.usuario_nombre ?? '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${fecha || '-'}</td>
        <td class="text-end">${fmtMoney(cantidad)}</td>
        <td>${usuarioNm ? `${usuarioNm} <small class="text-muted">(#${usuarioId})</small>` : usuarioId}</td>
        <td class="text-end">
          ${ isAdmin() ? `
            <button class="btn btn-sm btn-warning me-1" data-edit="${id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" data-del="${id}"><i class="fas fa-trash"></i></button>
          ` : '-' }
        </td>
      `;
      tbody?.appendChild(tr);
    });

    if (isAdmin()) {
      tbody?.querySelectorAll('button[data-del]').forEach(b => {
        b.addEventListener('click', onDelete);
      });
      tbody?.querySelectorAll('button[data-edit]').forEach(b => {
        b.addEventListener('click', onEditOpen);
      });
    }
  } catch (e) {
    console.error('Error cargando donaciones:', e);
    noRows?.classList.remove('d-none');
  }
}

function wireAltaRapida() {
  const form = document.getElementById('formNuevaDonacion');
  if (!form) return;

  // fecha por defecto = hoy
  const f = document.getElementById('fechaInput');
  if (f && !f.value) f.value = toIsoDate(new Date());

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const user = getAuthData();
    if (!user) { alert('Debes iniciar sesión'); return; }

    const fecha = (document.getElementById('fechaInput')?.value || '').trim();
    const monto = Number((document.getElementById('montoInput')?.value || '0').replace(',','.'));
    const usuarioOverride = (document.getElementById('usuarioInput')?.value || '').trim();

    if (!fecha) return alert('La fecha es obligatoria');
    if (!(monto > 0)) return alert('El monto debe ser mayor a 0');

    const payload = {
      fecha,                     
      cantidad: monto,
      usuario: usuarioOverride ? Number(usuarioOverride) : Number(user.id),
      campana: CAMPANA_ID
    };

    const btn = form.querySelector('button[type="submit"]');
    try {
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
      await makeRequest('/donaciones', 'POST', payload);
      form.reset();
      if (f) f.value = toIsoDate(new Date());
      await cargarCabeceraCampana();
      await cargarDonaciones();
    } catch (e) {
      alert(e.message || 'Error creando donación');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus-circle me-1"></i> Agregar'; }
    }
  });
}

async function onDelete(ev) {
  const id = ev.currentTarget.getAttribute('data-del');
  if (!id) return;
  if (!confirm('¿Eliminar esta donación?')) return;
  try {
    await makeRequest(`/donaciones/${id}`, 'DELETE');
    await cargarCabeceraCampana();
    await cargarDonaciones();
  } catch (e) {
    alert(e.message || 'Error eliminando donación');
  }
}

async function onEditOpen(ev) {
  const id = ev.currentTarget.getAttribute('data-edit');
  if (!id) return;

  let row;
  try {
    row = await makeRequest(`/donaciones/${id}`, 'GET');
  } catch {
    // fallback: intentar leer de la fila renderizada
    const tr = ev.currentTarget.closest('tr');
    const fecha = tr?.children[1]?.textContent?.trim();
    const cant  = tr?.children[2]?.textContent?.replaceAll('.','').replace(',','.') || '0';
    row = { id, fecha, cantidad: Number(cant) };
  }

  const r = normalizeRow(row);
  const nuevaFecha = prompt('Fecha (YYYY-MM-DD):', (r.fecha || '').toString().slice(0,10));
  if (!nuevaFecha) return;
  const nuevaCant = Number(prompt('Monto:', String(r.cantidad || 0)));
  if (!(nuevaCant > 0)) return alert('Monto inválido');

  try {
    await makeRequest(`/donaciones/${id}`, 'PUT', {
      fecha: nuevaFecha,
      cantidad: nuevaCant,
      usuario: r.usuario || (getAuthData()?.id),
      campana: CAMPANA_ID
    });
    await cargarCabeceraCampana();
    await cargarDonaciones();
  } catch (e) {
    alert(e.message || 'Error actualizando donación');
  }
}
