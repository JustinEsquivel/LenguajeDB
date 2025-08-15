// /js/mascotas/mascotas-detalle.js
import { makeRequest, normalizeRow, normalizeList, getAuthData } from '../utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadMascotaDetails();  // flujo principal
});

/* ------------------- refs & estado ------------------- */
const qs = new URLSearchParams(location.search);
const mascotaId = qs.get('id');

const loadingEl  = document.getElementById('loadingIndicator');
const errorBox   = document.getElementById('errorContainer');
const retryBtn   = errorBox?.querySelector('.retry-btn');
const detailsBox = document.getElementById('mascotaDetails');

const fotoContainer = document.getElementById('fotoContainer');
const nombreEl = document.getElementById('nombre');
const razaEl   = document.getElementById('raza');
const edadEl   = document.getElementById('edad');
const estadoEl = document.getElementById('estado');
const descEl   = document.getElementById('descripcion');

const editLink   = document.getElementById('editLink');
const btnAdoptar = document.getElementById('btnAdoptar');

// Adopción
const confirmBox   = document.getElementById('adopcionConfirm');
const okBox        = document.getElementById('adopcionOk');
const adopErrBox   = document.getElementById('adopcionErr');
const confNameEl   = document.getElementById('adopMascotaNombre');
const confEmailEl  = document.getElementById('adopUsuarioEmail');
const btnConf      = document.getElementById('btnConfirmarAdop');
const btnCancel    = document.getElementById('btnCancelarAdop');

let mascotaActual = null;

/* ------------------- eventos UI ------------------- */
retryBtn?.addEventListener('click', () => {
  errorBox.classList.add('d-none');
  loadMascotaDetails();
});

btnConf?.addEventListener('click', onConfirmarAdopcion);
btnCancel?.addEventListener('click', () => hideConfirm());

document.getElementById('formNuevoHistorial')?.addEventListener('submit', onNuevoHistorialSubmit);

/* ------------------- flujo principal ------------------- */
async function loadMascotaDetails() {
  if (!mascotaId) {
    showError('ID de mascota no proporcionado');
    return;
  }
  toggleLoading(true);
  try {
    const pet = await getMascotaById(mascotaId);
    mascotaActual = normalizeRow(pet || {});
    renderMascotaDetails(mascotaActual);
    await loadHistorial(mascotaActual.id);
  } catch (error) {
    console.error('Error al cargar detalles:', error);
    showError(error.message || 'Error al cargar la mascota');
  } finally {
    toggleLoading(false);
  }
}

async function getMascotaById(id) {
  try {
    return await makeRequest(`/api/mascotas/${encodeURIComponent(id)}`, 'GET');
  } catch {
    return await makeRequest(`/mascotas/${encodeURIComponent(id)}`, 'GET');
  }
}

/* ------------------- render ------------------- */
function renderMascotaDetails(m) {
  // Foto
  if (m.foto) {
    fotoContainer.innerHTML = `<img src="${escapeHtml(m.foto)}" alt="Foto de ${escapeHtml(m.nombre || '')}" class="img-fluid rounded" style="max-height: 300px;">`;
  } else {
    fotoContainer.innerHTML = `
      <div class="text-center py-4 bg-light rounded">
        <i class="fas fa-paw fa-4x text-muted mb-3"></i>
        <p class="text-muted">No hay foto disponible</p>
      </div>`;
  }

  // Datos
  nombreEl.textContent = m.nombre || '-';
  razaEl.textContent   = m.raza || '-';
  edadEl.textContent   = (m.edad ?? '') === '' ? '-' : `${m.edad}`;
  descEl.textContent   = m.descripcion || 'No disponible';

  const est = String(m.estado || '').trim();
  estadoEl.textContent = est || '-';
  estadoEl.className = 'badge ' + (
    est === 'Disponible'      ? 'bg-success' :
    est === 'En observación'  ? 'bg-warning text-dark' :
    est === 'En tratamiento'  ? 'bg-info text-dark' :
                                'bg-secondary'
  );

  // Editar (admin) + botón "Agregar registro"
  const user = getAuthData();
  if (user && Number(user.rol) === 1) {
    editLink.classList.remove('d-none');
    editLink.href = `/pages/mascotas/editar-mascota.html?id=${m.id}`;
    ensureAddHistButton();
  }

  // Adoptar (solo logueado y estado Disponible)
  if (user && est === 'Disponible') {
    btnAdoptar.classList.remove('d-none');
    btnAdoptar.onclick = () => showConfirm(m, user);
  } else {
    btnAdoptar.classList.add('d-none');
  }

  // Si está en tratamiento, botón para ver tratamiento activo
  if (est === 'En tratamiento') {
    const actions = detailsBox.querySelector('.mt-3.d-flex');
    if (actions && !actions.querySelector('#btnVerTratamiento')) {
      const btn = document.createElement('button');
      btn.id = 'btnVerTratamiento';
      btn.className = 'btn btn-outline-info d-inline-flex align-items-center';
      btn.innerHTML = '<i class="fas fa-notes-medical me-1"></i> Ver tratamiento';
      btn.onclick = onVerTratamientoClick;
      actions.appendChild(btn);
    }
  }

  detailsBox.classList.remove('d-none');
}

/* ------------------- adopción ------------------- */
function showConfirm(m, user) {
  confNameEl.textContent  = m.nombre || '-';
  confEmailEl.textContent = user?.email || user?.correo || 'correo no disponible';
  adopErrBox.classList.add('d-none');
  okBox.classList.add('d-none');
  confirmBox.classList.remove('d-none');
  confirmBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideConfirm() {
  confirmBox.classList.add('d-none');
}

function setEstadoObservacionEnUI() {
  estadoEl.textContent = 'En observación';
  estadoEl.className = 'badge bg-warning text-dark';
  if (btnAdoptar) {
    btnAdoptar.disabled = true;
    btnAdoptar.textContent = 'En observación';
  }
}

async function onConfirmarAdopcion() {
  try {
    btnConf.disabled = true;
    btnConf.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Enviando...';

    const user = getAuthData();
    if (!user) throw new Error('Debes iniciar sesión para adoptar.');
    if (!mascotaActual) throw new Error('No se encontró la mascota.');

    const payload = {
      fecha: new Date().toISOString().slice(0,10),
      usuario: Number(user.id),
      mascota: Number(mascotaActual.id)
    };

    try { await makeRequest('/api/adopciones', 'POST', payload); }
    catch { await makeRequest('/adopciones', 'POST', payload); }

    hideConfirm();
    okBox.classList.remove('d-none');
    setEstadoObservacionEnUI();
    okBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {
    adopErrBox.textContent = e?.message || 'No fue posible enviar la solicitud.';
    adopErrBox.classList.remove('d-none');
  } finally {
    btnConf.disabled = false;
    btnConf.innerHTML = '<i class="fas fa-paper-plane"></i> Confirmar solicitud';
  }
}

/* ------------------- historial (tabla) ------------------- */
async function loadHistorial(id) {
  try {
    let rows = null;
    try {
      rows = await makeRequest(`/api/mascotas/${encodeURIComponent(id)}/historial`, 'GET');
    } catch {
      rows = await makeRequest(`/mascotas/${encodeURIComponent(id)}/historial`, 'GET');
    }

    const list = normalizeList(rows || []);
    const tbody = document.getElementById('historialTableBody');

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Sin registros</td></tr>`;
      document.getElementById('historialWrapper')?.classList.remove('d-none');
      return;
    }

    tbody.innerHTML = list.map(r => {
      const row = normalizeRow(r);
      const fecha = row.fecha ? new Date(row.fecha).toLocaleDateString() : (row.fecha_registro || '');
      return `
        <tr>
          <td>${escapeHtml(fecha)}</td>
          <td>${escapeHtml(row.diagnostico || '-')}</td>
          <td>${escapeHtml(row.tratamiento || '-')}</td>
          <td>${escapeHtml(row.veterinario || '-')}</td>
          <td>${escapeHtml(row.observaciones || '-')}</td>
          <td><span class="badge ${row.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}">
            ${escapeHtml(row.estado || '-')}
          </span></td>
        </tr>`;
    }).join('');

    document.getElementById('historialWrapper').classList.remove('d-none');
  } catch (err) {
    console.debug('Historial no disponible:', err?.message || err);
  }
}

/* ------------------- tratamiento ACTIVO ------------------- */
async function onVerTratamientoClick() {
  document.getElementById('tratamientoLoader')?.classList.remove('d-none');
  document.getElementById('tratamientoEmpty')?.classList.add('d-none');
  const content = document.getElementById('tratamientoContent');
  if (content) content.style.display = 'none';

  const row = await fetchHistorialActivo(mascotaActual?.id);
  document.getElementById('tratamientoLoader')?.classList.add('d-none');
  showTratamientoModal(row);
}

async function fetchHistorialActivo(id) {
  if (!id) return null;
  try {
    let res = null;
    try {
      res = await makeRequest(`/api/mascotas/${encodeURIComponent(id)}/historial-activo`, 'GET');
    } catch {
      // si no tienes esta ruta, caes al historial completo y filtras
      res = await makeRequest(`/api/mascotas/${encodeURIComponent(id)}/historial`, 'GET');
    }

    const list = Array.isArray(res) ? res : (res ? [res] : []);
    if (!list.length) return null;

    const rows = list.map(normalizeRow).filter(r => (r.estado || '') === 'Activo');
    rows.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
    return rows[0] || null;
  } catch {
    return null;
  }
}

function showTratamientoModal(row) {
  const loader = document.getElementById('tratamientoLoader');
  const content = document.getElementById('tratamientoContent');
  const empty = document.getElementById('tratamientoEmpty');
  const verDet = document.getElementById('t_verDetalle');

  if (!row) {
    loader.classList.add('d-none');
    content.style.display = 'none';
    empty.classList.remove('d-none');
    verDet.classList.add('d-none');
  } else {
    document.getElementById('t_fecha').textContent = row.fecha ? new Date(row.fecha).toLocaleDateString() : '-';
    document.getElementById('t_diag').textContent  = row.diagnostico || '-';
    document.getElementById('t_trat').textContent  = row.tratamiento || '-';
    document.getElementById('t_vet').textContent   = row.veterinario || '-';
    document.getElementById('t_obs').textContent   = row.observaciones || '-';
    empty.classList.add('d-none');
    content.style.display = '';
    if (row.id) {
      verDet.href = `/pages/historial/detalle-historial.html?id=${encodeURIComponent(row.id)}`;
      verDet.classList.remove('d-none');
    } else {
      verDet.classList.add('d-none');
    }
  }

  // requiere Bootstrap Bundle cargado en el HTML
  const el = document.getElementById('tratamientoModal');
  const modal = new bootstrap.Modal(el);
  modal.show();
}

/* ------------------- Nuevo historial (solo admin) ------------------- */
function ensureAddHistButton() {
  const user = getAuthData();
  if (!user || Number(user.rol) !== 1) return;

  const actions = detailsBox.querySelector('.mt-3.d-flex');
  if (!actions || actions.querySelector('#btnAddHist')) return;

  const btn = document.createElement('button');
  btn.id = 'btnAddHist';
  btn.className = 'btn btn-outline-primary';
  btn.innerHTML = '<i class="fas fa-plus-circle me-1"></i> Agregar registro';
  btn.addEventListener('click', () => {
    document.getElementById('formNuevoHistorial')?.reset();
    document.getElementById('fh_estado').value = 'Activo';
    const today = new Date().toISOString().slice(0,10);
    const f = document.getElementById('fh_fecha'); if (f) f.value = today;
    setHistFormError('');
    new bootstrap.Modal(document.getElementById('nuevoHistorialModal')).show();
  });
  actions.appendChild(btn);
}

function setHistFormError(msg='') {
  const box = document.getElementById('histFormError');
  if (!box) return;
  if (!msg) { box.classList.add('d-none'); box.textContent = ''; return; }
  box.textContent = msg;
  box.classList.remove('d-none');
}

async function onNuevoHistorialSubmit(e) {
  e.preventDefault();
  setHistFormError('');

  try {
    if (!mascotaActual?.id) throw new Error('Mascota no válida.');

    const fechaVal = document.getElementById('fh_fecha').value;
    const diag     = (document.getElementById('fh_diag').value || '').trim();
    const trat     = (document.getElementById('fh_trat').value || '').trim();
    const vet      = (document.getElementById('fh_vet').value  || '').trim();
    const obs      = (document.getElementById('fh_obs').value  || '').trim();
    const estado   = document.getElementById('fh_estado').value;

    if (!fechaVal || !diag || !trat || !vet) {
      throw new Error('Fecha, diagnóstico, tratamiento y veterinario son obligatorios.');
    }

    const btn = document.getElementById('btnSaveHist');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';

    const payload = {
      mascota: Number(mascotaActual.id),
      fecha: fechaVal,
      diagnostico: diag,
      tratamiento: trat,
      veterinario: vet,
      observaciones: obs || null,
      estado
    };

    try {
      await makeRequest('/api/historial-medico', 'POST', payload);
    } catch {
      await makeRequest('/historial-medico', 'POST', payload);
    }

    // Cierra modal y refresca
    const modalEl = document.getElementById('nuevoHistorialModal');
    (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    await loadHistorial(mascotaActual.id);

  } catch (err) {
    setHistFormError(err?.message || 'No fue posible guardar el registro.');
  } finally {
    const btn = document.getElementById('btnSaveHist');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save me-1"></i> Guardar';
    }
  }
}

/* ------------------- helpers ------------------- */
function toggleLoading(on) {
  loadingEl.classList.toggle('d-none', !on);
  if (on) {
    detailsBox.classList.add('d-none');
    errorBox.classList.add('d-none');
  }
}

function showError(message) {
  document.getElementById('loadingIndicator').classList.add('d-none');
  errorBox.classList.remove('d-none');
  const errorMessage = errorBox.querySelector('.error-message');
  if (errorMessage) errorMessage.textContent = message || 'Error al cargar la mascota';
}

function escapeHtml(str='') {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
