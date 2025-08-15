import { makeRequest, normalizeRow } from '/js/utils.js';

let EDIT = false;
let ID = null;

document.addEventListener('DOMContentLoaded', async ()=>{
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol)!==1) { location.href='/index.html'; return; }

  const qs = new URLSearchParams(location.search);
  ID = qs.get('id'); EDIT = !!ID;

  const form  = document.getElementById('historialForm');
  const errBx = document.getElementById('errorSummary');
  const loader= document.getElementById('loadingIndicator');

  if (EDIT) {
    loader?.classList?.remove('d-none');
    form?.classList?.add('d-none');
    try {
      const row = await getById(ID);
      const r = normalizeRow(row||{});
      document.getElementById('historialId')?.setAttribute('value', r.id);
      setVal('mascota', r.mascota);
      setVal('fecha', r.fecha ? String(r.fecha).slice(0,10) : '');
      setVal('estado', r.estado || 'Activo');
      setVal('diagnostico', r.diagnostico || '');
      setVal('tratamiento', r.tratamiento || '');
      setVal('veterinario', r.veterinario || '');
      setVal('observaciones', r.observaciones || '');
      const cancel = document.getElementById('cancelLink');
      if (cancel) cancel.href = '/pages/historial/historial-admin.html';
    } catch (e) {
      errBx.classList.remove('d-none'); errBx.textContent = e?.message || 'No fue posible cargar.';
    } finally {
      loader?.classList?.add('d-none'); form?.classList?.remove('d-none');
    }
  }

  form?.addEventListener('submit', onSubmit);
});

function setVal(id,v){ const el=document.getElementById(id); if (el) el.value = (v??''); }

function getPayload(){
  return {
    mascota: Number(document.getElementById('mascota').value),
    fecha: document.getElementById('fecha').value,
    diagnostico: document.getElementById('diagnostico').value.trim(),
    tratamiento: document.getElementById('tratamiento').value.trim(),
    veterinario: document.getElementById('veterinario').value.trim() || null,
    observaciones: document.getElementById('observaciones').value.trim() || null,
    estado: document.getElementById('estado').value
  };
}

function validate(p){
  const errs=[];
  if (!p.mascota || p.mascota<1) errs.push('Mascota (ID) es requerido');
  if (!p.fecha) errs.push('Fecha es requerida');
  if (!p.diagnostico) errs.push('Diagnóstico es requerido');
  if (!p.tratamiento) errs.push('Tratamiento es requerido');
  if (!['Activo','Inactivo'].includes(p.estado)) errs.push('Estado inválido');
  if (errs.length) throw new Error(errs.join('. '));
}

async function getById(id){
  try { return await makeRequest(`/api/historial-medico/${id}`, 'GET'); }
  catch { return await makeRequest(`/historial-medico/${id}`, 'GET'); }
}

async function saveNew(p){
  try { return await makeRequest('/api/historial-medico', 'POST', p); }
  catch { return await makeRequest('/historial-medico', 'POST', p); }
}
async function saveEdit(id,p){
  try { return await makeRequest(`/api/historial-medico/${id}`, 'PUT', p); }
  catch { return await makeRequest(`/historial-medico/${id}`, 'PUT', p); }
}

async function onSubmit(e){
  e.preventDefault();
  const btn = (e.submitter || document.querySelector('#historialForm button[type="submit"]'));
  const errBx = document.getElementById('errorSummary');
  errBx.classList.add('d-none'); errBx.textContent = '';
  try {
    const payload = getPayload();
    validate(payload);
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';
    if (EDIT) {
      await saveEdit(ID, payload);
      location.href = `/pages/historial/detalle-historial.html?id=${encodeURIComponent(ID)}&success=ok`;
    } else {
      await saveNew(payload);
      location.href = '/pages/historial/historial-admin.html';
    }
  } catch (err) {
    errBx.classList.remove('d-none'); errBx.textContent = err?.message || 'Error al guardar';
  } finally {
    btn.disabled = false; btn.innerHTML = EDIT ? '<i class="fas fa-save me-1"></i> Guardar cambios'
                                               : '<i class="fas fa-save me-1"></i> Guardar';
  }
}
