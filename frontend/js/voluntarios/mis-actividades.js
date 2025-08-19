import { makeRequest, getAuthData } from '../utils.js';

const $ = (id) => document.getElementById(id);
const fmtDate = (v) => {
  if (!v) return '-';
  try { return new Date(v).toLocaleDateString(); } catch { return String(v); }
};

let VOL_ID = null;
let USER_ID = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const u = getAuthData();
  if (!u || Number(u.rol) !== 3) {
    // Solo voluntario
    location.href = '/index.html';
    return;
  }
  USER_ID = Number(u.id);

  // Cargar/crear voluntariado
  await loadVoluntariado();

  // Bind botones
  $('btnAddAct')?.addEventListener('click', addActividad);
  $('btnDelAll')?.addEventListener('click', deleteTodas);
  $('btnCrearVol')?.addEventListener('click', crearVoluntariado);
}


async function loadVoluntariado() {
  toggleVolLoading(true);
  try {
    // 1) Intento directo por usuario 
    let vol = null;
    try {
      vol = await makeRequest(`/api/voluntarios/by-usuario/${USER_ID}`, 'GET');
    } catch {}

    // 2) Fallback: buscar entre activos y filtrar por usuario
    if (!vol) {
      try {
        const list = await makeRequest('/api/voluntarios/activos', 'GET');
        vol = (Array.isArray(list) ? list : []).find(x =>
          Number(x.usuario ?? x.USUARIO) === USER_ID
        ) || null;
      } catch {}
    }

    if (!vol) {
      // No existe: muestra CTA para crear
      $('noVolWrapper').classList.remove('d-none');
      $('actsCard').classList.add('d-none');
      return;
    }

    // Si solo obtuvimos un id, pedir el detalle
    if (!vol.fechainicio && vol.id) {
      try {
        vol = await makeRequest(`/api/voluntarios/${vol.id}`, 'GET');
      } catch {}
    }

    VOL_ID = Number(vol.id ?? vol.ID);
    renderVol(vol);
    $('actsCard').classList.remove('d-none');
    await loadActividades();
  } catch (e) {
    showMsg(e?.message || 'No fue posible cargar tu voluntariado', 'danger');
  } finally {
    toggleVolLoading(false);
  }
}

async function crearVoluntariado() {
  try {
    $('btnCrearVol').disabled = true;
    $('btnCrearVol').innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Creando…';
    const payload = {
      usuario: USER_ID,
      fechaInicio: new Date(),   // el backend convierte a DATE
      horas: 0,
      estado: 'Activo'
    };
    const r = await makeRequest('/api/voluntarios', 'POST', payload);
    VOL_ID = Number(r.id ?? r.ID);
    $('noVolWrapper').classList.add('d-none');
    await loadVoluntariado();
    showMsg('Voluntariado creado correctamente.', 'success');
  } catch (e) {
    showMsg(e?.message || 'No fue posible crear tu voluntariado', 'danger');
  } finally {
    $('btnCrearVol').disabled = false;
    $('btnCrearVol').innerHTML = '<i class="fas fa-user-plus me-1"></i> Iniciar voluntariado';
  }
}

function renderVol(v) {
  const id    = v.id ?? v.ID;
  const usr   = v.usuario ?? v.USUARIO;
  const fin   = v.fechafin ?? v.FECHAFIN;
  const ini   = v.fechainicio ?? v.FECHAINICIO;
  const horas = v.horas ?? v.HORAS ?? 0;
  const est   = v.estado ?? v.ESTADO ?? '-';

  $('vId').textContent     = id;
  $('vUsuario').textContent= usr;
  $('vInicio').textContent = fmtDate(ini);
  $('vFin').textContent    = fin ? fmtDate(fin) : '-';
  $('vHoras').textContent  = horas;
  const badge = est === 'Activo' ? 'bg-success' : 'bg-secondary';
  $('vEstado').className = `badge ${badge}`;
  $('vEstado').textContent = est;

  $('volWrapper').classList.remove('d-none');
}

async function loadActividades() {
  if (!VOL_ID) return;
  try {
    const rows = await makeRequest(`/api/voluntarios/${VOL_ID}/actividades`, 'GET');
    const list = Array.isArray(rows) ? rows : [];
    $('actsBody').innerHTML = list.map(r => {
      const act = (r.actividad ?? r.ACTIVIDAD ?? '').trim();
      const enc = encodeURIComponent(act);
      return `
        <tr>
          <td>${escapeHtml(act)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" data-act="${enc}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>`;
    }).join('') || `
      <tr><td colspan="2" class="text-muted text-center">Sin actividades</td></tr>
    `;

    $('totalActs').textContent = list.length;

    // bind delete
    document.querySelectorAll('#actsBody button[data-act]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const act = e.currentTarget.getAttribute('data-act');
        if (!act) return;
        if (!confirm('¿Eliminar esta actividad?')) return;
        try {
          await makeRequest(`/api/voluntarios/${VOL_ID}/actividades/${act}`, 'DELETE');
          await loadActividades();
        } catch (err) {
          showMsg(err?.message || 'No se pudo eliminar la actividad', 'danger');
        }
      });
    });

  } catch (e) {
    showMsg(e?.message || 'No fue posible cargar actividades', 'danger');
  }
}

async function addActividad() {
  const val = ($('actInput').value || '').trim();
  if (!val) return showMsg('Ingresa una actividad.', 'warning');
  try {
    $('btnAddAct').disabled = true;
    $('btnAddAct').innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Agregando…';
    await makeRequest(`/api/voluntarios/${VOL_ID}/actividades`, 'POST', { actividad: val });
    $('actInput').value = '';
    await loadActividades();
  } catch (e) {
    showMsg(e?.message || 'No fue posible agregar la actividad', 'danger');
  } finally {
    $('btnAddAct').disabled = false;
    $('btnAddAct').innerHTML = '<i class="fas fa-plus me-1"></i> Agregar actividad';
  }
}

async function deleteTodas() {
  if (!confirm('¿Eliminar TODAS las actividades?')) return;
  try {
    await makeRequest(`/api/voluntarios/${VOL_ID}/actividades`, 'DELETE');
    await loadActividades();
  } catch (e) {
    showMsg(e?.message || 'No fue posible eliminar las actividades', 'danger');
  }
}

function toggleVolLoading(on) {
  $('loadingVol')?.classList.toggle('d-none', !on);
  if (on) {
    $('noVolWrapper')?.classList.add('d-none');
    $('volWrapper')?.classList.add('d-none');
  }
}

function showMsg(text, type='info') {
  const box = $('msgBox');
  if (!box) return;
  box.className = `alert alert-${type}`;
  box.textContent = text;
  box.classList.remove('d-none');
  // auto-hide suave
  setTimeout(() => box.classList.add('d-none'), 3500);
}

function escapeHtml(str='') {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
