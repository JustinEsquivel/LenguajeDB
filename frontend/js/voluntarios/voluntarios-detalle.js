import { makeRequest, normalizeRow } from '/js/utils.js';

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async ()=>{
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol)!==1) { location.href='/index.html'; return; }

  const qs = new URLSearchParams(location.search);
  const id = qs.get('id');

  const loading = $('loadingIndicator');
  const card    = $('volDetails');
  const errBox  = $('errorContainer');

  try {
    loading.classList.remove('d-none');
    const row = await getById(id);
    const r = normalizeRow(row || {});
    setTxt('id', r.id);
    setTxt('usuario', r.usuario);
    setTxt('fechaInicio', fmtDate(r.fechainicio));
    setTxt('fechaFin', fmtDate(r.fechafin));
    setTxt('horas', r.horas ?? 0);

    const est = r.estado || '-';
    const eSpan = $('estado'); eSpan.textContent = est;
    eSpan.className = 'badge ' + (est==='Activo' ? 'bg-success' : 'bg-secondary');

    const edit = $('editLink'); if (edit) edit.href = `/pages/voluntarios/editar-voluntario.html?id=${encodeURIComponent(id)}`;

    $('btnEliminar').onclick = async ()=>{
      if (!confirm('¿Eliminar este voluntario?')) return;
      try { await del(id); alert('Voluntario eliminado'); location.href='/pages/voluntarios/voluntarios-admin.html'; }
      catch(e){ alert(e?.message || 'No fue posible eliminar'); }
    };

    // Actividades
    await loadActs(id);
    await loadActCount(id);

    // Agregar actividad
    $('actForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const act = ($('actividadTxt')?.value || '').trim();
      if (!act) return;
      try {
        await addAct(id, act);
        $('actividadTxt').value = '';
        await loadActs(id);
        await loadActCount(id);
      } catch (err) { alert(err?.message || 'No fue posible agregar la actividad'); }
    });

    // Eliminar todas
    $('btnDelAllActs')?.addEventListener('click', async ()=>{
      if (!confirm('¿Eliminar TODAS las actividades?')) return;
      try {
        await delAllActs(id);
        await loadActs(id);
        await loadActCount(id);
      } catch (err) { alert(err?.message || 'No fue posible eliminar'); }
    });

    card.classList.remove('d-none');
  } catch (e) {
    errBox.classList.remove('d-none');
    errBox.querySelector('.error-message').textContent = e?.message || 'No fue posible cargar.';
  } finally {
    loading.classList.add('d-none');
  }
});

function setTxt(id,v){ const el=$(id); if (el) el.textContent = v; }
function fmtDate(v){
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d) ? String(v).slice(0,10) : d.toLocaleDateString();
}

async function getById(id){
  try { return await makeRequest(`/api/voluntarios/${id}`, 'GET'); }
  catch { return await makeRequest(`/voluntarios/${id}`, 'GET'); }
}
async function del(id){
  try { return await makeRequest(`/api/voluntarios/${id}`, 'DELETE'); }
  catch { return await makeRequest(`/voluntarios/${id}`, 'DELETE'); }
}

// Actividades
async function listActs(volId){
  try { return await makeRequest(`/api/voluntarios/${volId}/actividades`, 'GET'); }
  catch { return await makeRequest(`/voluntarios/${volId}/actividades`, 'GET'); }
}
async function countActs(volId){
  try { return await makeRequest(`/api/voluntarios/${volId}/actividades-count`, 'GET'); }
  catch { return await makeRequest(`/voluntarios/${volId}/actividades-count`, 'GET'); }
}
async function addAct(volId, actividad){
  try { return await makeRequest(`/api/voluntarios/${volId}/actividades`, 'POST', { actividad }); }
  catch { return await makeRequest(`/voluntarios/${volId}/actividades`, 'POST', { actividad }); }
}
async function delAct(volId, actividad){
  const enc = encodeURIComponent(actividad);
  try { return await makeRequest(`/api/voluntarios/${volId}/actividades/${enc}`, 'DELETE'); }
  catch { return await makeRequest(`/voluntarios/${volId}/actividades/${enc}`, 'DELETE'); }
}
async function delAllActs(volId){
  try { return await makeRequest(`/api/voluntarios/${volId}/actividades`, 'DELETE'); }
  catch { return await makeRequest(`/voluntarios/${volId}/actividades`, 'DELETE'); }
}

async function loadActs(volId){
  const tbody = $('actTableBody'); tbody.innerHTML = '';
  let rows = [];
  try { rows = await listActs(volId); } catch { rows = []; }

  if (!Array.isArray(rows) || rows.length===0) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-muted text-center">Sin actividades</td></tr>`;
    return;
  }
  rows.forEach(r=>{
    const a = normalizeRow(r).actividad || r.actividad || '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" data-act="${a}">
          <i class="fas fa-trash"></i>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('button[data-act]').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const act = e.currentTarget.getAttribute('data-act');
      if (!act) return;
      if (!confirm(`¿Eliminar la actividad "${act}"?`)) return;
      try { await delAct(volId, act); await loadActs(volId); await loadActCount(volId); }
      catch(err){ alert(err?.message || 'No fue posible eliminar'); }
    });
  });
}

async function loadActCount(volId){
  try {
    const r = await countActs(volId);
    const total = (r && (r.total ?? r.TOTAL)) ?? 0;
    $('actCount').textContent = `Total actividades: ${total}`;
  } catch {
    $('actCount').textContent = '';
  }
}
