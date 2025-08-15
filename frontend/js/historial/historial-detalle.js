import { makeRequest, normalizeRow } from '/js/utils.js';

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async ()=>{
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol)!==1) { location.href='/index.html'; return; }

  const qs = new URLSearchParams(location.search);
  const id = qs.get('id');

  const loading = $('loadingIndicator');
  const card    = $('historialDetails');
  const errBox  = $('errorContainer');

  try {
    loading.classList.remove('d-none');
    const row = await getById(id);
    const r = normalizeRow(row || {});
    setTxt('id', r.id); setTxt('mascota', r.mascota);
    setTxt('fecha', r.fecha ? new Date(r.fecha).toLocaleDateString() : '-');
    setTxt('diagnostico', r.diagnostico || '-');
    setTxt('tratamiento', r.tratamiento || '-');
    setTxt('veterinario', r.veterinario || '-');
    setTxt('observaciones', r.observaciones || '-');
    const est = r.estado || '-';
    const eSpan = $('estado'); eSpan.textContent = est;
    eSpan.className = 'badge ' + (est==='Activo' ? 'bg-success' : 'bg-secondary');

    const edit = $('editLink'); if (edit) edit.href = `/pages/historial/editar-historial.html?id=${encodeURIComponent(id)}`;

    $('btnEliminar').onclick = async ()=>{
      if (!confirm('¿Eliminar este registro?')) return;
      try { await del(id); alert('Registro eliminado'); location.href='/pages/historial/historial-admin.html'; }
      catch(e){ alert(e?.message || 'No fue posible eliminar'); }
    };

    card.classList.remove('d-none');
  } catch (e) {
    errBox.classList.remove('d-none');
    errBox.querySelector('.error-message').textContent = e?.message || 'No fue posible cargar.';
  } finally {
    loading.classList.add('d-none');
  }
});

function setTxt(id,v){ const el=$(id); if (el) el.textContent = v; }

async function getById(id){
  try { return await makeRequest(`/api/historial-medico/${id}`, 'GET'); }
  catch { return await makeRequest(`/historial-medico/${id}`, 'GET'); }
}
async function del(id){
  try { return await makeRequest(`/api/historial-medico/${id}`, 'DELETE'); }
  catch { return await makeRequest(`/historial-medico/${id}`, 'DELETE'); }
}
