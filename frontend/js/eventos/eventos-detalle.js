import { makeRequest, normalizeRow, getAuthData } from '../utils.js';

function esc(s=''){
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function fmtFecha(v){
  if(!v) return '-';
  const d = new Date(v);
  return isNaN(d) ? esc(v) : d.toLocaleString();
}

function badgeByEstado(estado=''){
  const e = estado.toLowerCase();
  if (e === 'en curso') return 'bg-success';
  if (e === 'planificado') return 'bg-primary';
  if (e === 'finalizado') return 'bg-secondary';
  return 'bg-light text-dark';
}

function esAsistible(estado=''){
  const e = estado.toLowerCase();
  return e === 'planificado' || e === 'en curso';
}


// GET /api/eventos/:id/asistencias -> length
async function fetchAsistentesCount(eventoId){
  try{
    const list = await makeRequest(`/api/eventos/${eventoId}/asistencias`, 'GET');
    return Array.isArray(list) ? list.length : 0;
  }catch{
    return 0;
  }
}

// GET /api/eventos/:id/asistencias/usuario/:usuarioId/existe -> {exists:boolean}
async function fetchExiste(eventoId, usuarioId){
  try{
    const r = await makeRequest(`/api/eventos/${eventoId}/asistencias/usuario/${usuarioId}/existe`, 'GET');
    return !!(r && (r.exists === 1 || r.exists === true));
  }catch{
    return false;
  }
}

// POST /api/asistencias { evento, usuario }
async function postAsistir(eventoId, usuarioId){
  return await makeRequest(`/api/asistencias`, 'POST', { evento: Number(eventoId), usuario: Number(usuarioId) });
}

// DELETE /api/eventos/:eventoId/asistencias/usuario/:usuarioId
async function deleteDesasistir(eventoId, usuarioId){
  return await makeRequest(`/api/eventos/${eventoId}/asistencias/usuario/${usuarioId}`, 'DELETE');
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const qs = new URLSearchParams(location.search);
  const id = qs.get('id');

  const loading   = document.getElementById('loadingIndicator');
  const errorBox  = document.getElementById('errorContainer');
  const details   = document.getElementById('eventoDetails');

  const nombreEl  = document.getElementById('nombre');
  const descEl    = document.getElementById('descripcion');
  const fechaEl   = document.getElementById('fecha');
  const ubicEl    = document.getElementById('ubicacion');
  const tipoEl    = document.getElementById('tipo');
  const estadoEl  = document.getElementById('estado');
  const respEl    = document.getElementById('responsable');
  const asisEl    = document.getElementById('asistentes');

  const editLink  = document.getElementById('editLink');
  const btnIn     = document.getElementById('btnAsistir');
  const btnOut    = document.getElementById('btnDesasistir');

  if (!id){
    errorBox.classList.remove('d-none');
    errorBox.querySelector('.error-message').textContent = 'ID de evento no proporcionado';
    return;
  }

  async function load(){
    loading.classList.remove('d-none');
    try{
      const raw = await makeRequest(`/api/eventos/${id}`, 'GET');
      const e = normalizeRow(raw);

      nombreEl.textContent = e.nombre || '-';
      descEl.textContent   = e.descripcion || '-';
      fechaEl.textContent  = fmtFecha(e.fecha);
      tipoEl.textContent   = e.tipo || '-';
      ubicEl.textContent   = (e.tipo === 'Virtual') ? (e.ubicacion || 'En línea') : (e.ubicacion || '-');

      const est = e.estado || '-';
      estadoEl.textContent = est;
      estadoEl.className = 'badge ' + badgeByEstado(est);

      respEl.textContent = e.responsable_nombre || e.responsable || '-';

      // Mostrar botón Editar solo para admin
      const u = getAuthData();
      if (u && Number(u.rol) === 1) {
        editLink.classList.remove('d-none');
        editLink.href = `/pages/eventos/editar-evento.html?id=${e.id}`;
      }

      // Conteo de asistentes
      const total = await fetchAsistentesCount(e.id);
      asisEl.textContent = total;

      // Asistencia UI
      await configurarAsistenciaUI(e.id, est);

      details.classList.remove('d-none');
    }catch(err){
      console.error(err);
      errorBox.classList.remove('d-none');
      errorBox.querySelector('.error-message').textContent = err.message || 'No fue posible cargar el evento';
    }finally{
      loading.classList.add('d-none');
    }
  }

  async function configurarAsistenciaUI(eventoId, estado){
    const user = getAuthData();

    // Oculta por defecto
    btnIn.classList.add('d-none');
    btnOut.classList.add('d-none');

    // Requiere login + estado asistible
    if (!user || !esAsistible(estado)) return;

    // ¿Ya asiste?
    const ya = await fetchExiste(eventoId, user.id);
    if (ya) btnOut.classList.remove('d-none');
    else    btnIn.classList.remove('d-none');

    // Handlers
    btnIn.onclick = async () => {
      try {
        btnIn.disabled = true; btnIn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';
        await postAsistir(eventoId, user.id);
        // refrescar conteo y botones
        const total = await fetchAsistentesCount(eventoId);
        document.getElementById('asistentes').textContent = total;
        btnIn.classList.add('d-none');
        btnOut.classList.remove('d-none');
      } catch (e) {
        const msg = String(e?.message || e?.error || e || '');
        if (msg.includes('-26003') || /Ya registrado/i.test(msg)) {
          alert('Ya estás registrado en este evento.');
        } else {
          alert('No fue posible registrar tu asistencia.');
        }
      } finally {
        btnIn.disabled = false; btnIn.innerHTML = '<i class="fas fa-user-check me-1"></i> Asistir';
      }
    };

    btnOut.onclick = async () => {
      if (!confirm('¿Cancelar tu asistencia?')) return;
      try {
        btnOut.disabled = true; btnOut.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Procesando...';
        await deleteDesasistir(eventoId, user.id);
        const total = await fetchAsistentesCount(eventoId);
        document.getElementById('asistentes').textContent = total;
        btnOut.classList.add('d-none');
        btnIn.classList.remove('d-none');
      } catch (e) {
        alert('No fue posible cancelar tu asistencia.');
      } finally {
        btnOut.disabled = false; btnOut.innerHTML = '<i class="fas fa-user-times me-1"></i> Cancelar asistencia';
      }
    };
  }

  document.querySelector('#errorContainer .retry-btn')?.addEventListener('click',()=>{
    errorBox.classList.add('d-none');
    load();
  });

  load();
});
