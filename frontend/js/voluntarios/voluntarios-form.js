// ES Module
import { makeRequest, normalizeRow } from '/js/utils.js';

let EDIT = false;
let ID = null;

document.addEventListener('DOMContentLoaded', async ()=>{
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol)!==1) { location.href='/index.html'; return; }

  const qs = new URLSearchParams(location.search);
  ID = qs.get('id'); EDIT = !!ID;

  const form   = document.getElementById('volForm');
  const errBx  = document.getElementById('errorSummary');
  const loader = document.getElementById('loadingIndicator');

  if (EDIT) {
    loader?.classList?.remove('d-none');
    form?.classList?.classList?.add('d-none');
    try {
      const row = await getById(ID);
      const r = normalizeRow(row||{});
      setVal('volId', r.id);
      setVal('usuario', r.usuario);
      setDateVal('fechaInicio', r.fechainicio);
      setDateVal('fechaFin', r.fechafin);
      setVal('horas', r.horas ?? 0);
      setVal('estado', r.estado || 'Activo');

      // link cancelar a detalle
      const cancel = document.getElementById('cancelLink');
      if (cancel) cancel.href = `/pages/voluntarios/detalle-voluntario.html?id=${encodeURIComponent(ID)}`;
    } catch (e) {
      errBx.classList.remove('d-none'); errBx.textContent = e?.message || 'No fue posible cargar.';
    } finally {
      loader?.classList?.add('d-none');
      form?.classList?.remove('d-none');
    }
  }

  form?.addEventListener('submit', onSubmit);
});

function setVal(id,v){ const el=document.getElementById(id); if (el) el.value = (v??''); }
function toDateInput(v){
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? String(v).slice(0,10) : d.toISOString().slice(0,10);
}
function setDateVal(id,v){ const el=document.getElementById(id); if (el) el.value = toDateInput(v); }

function getPayload(){
  return {
    usuario: Number(document.getElementById('usuario').value),
    fechaInicio: document.getElementById('fechaInicio').value, // YYYY-MM-DD
    fechaFin: document.getElementById('fechaFin')?.value || null,
    horas: Number(document.getElementById('horas').value) || 0,
    estado: document.getElementById('estado').value
  };
}

function validate(p){
  const errs=[];
  if (!p.usuario || p.usuario<1) errs.push('Usuario (ID) es requerido');
  if (!p.fechaInicio) errs.push('Fecha inicio es requerida');
  if (p.horas<0) errs.push('Horas no puede ser negativo');
  if (!['Activo','Inactivo'].includes(p.estado)) errs.push('Estado inválido');
  if (errs.length) throw new Error(errs.join('. '));
}

async function getById(id){
  try { return await makeRequest(`/api/voluntarios/${id}`, 'GET'); }
  catch { return await makeRequest(`/voluntarios/${id}`, 'GET'); }
}

async function saveNew(p){
  try { return await makeRequest('/api/voluntarios', 'POST', p); }
  catch { return await makeRequest('/voluntarios', 'POST', p); }
}
async function saveEdit(id,p){
  try { return await makeRequest(`/api/voluntarios/${id}`, 'PUT', p); }
  catch { return await makeRequest(`/voluntarios/${id}`, 'PUT', p); }
}

async function onSubmit(e){
  e.preventDefault();
  const btn = (e.submitter || document.querySelector('#volForm button[type="submit"]'));
  const errBx = document.getElementById('errorSummary');
  errBx.classList.add('d-none'); errBx.textContent = '';
  try {
    const payload = getPayload();
    validate(payload);
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';
    if (EDIT) {
      await saveEdit(ID, payload);
      location.href = `/pages/voluntarios/detalle-voluntario.html?id=${encodeURIComponent(ID)}&success=ok`;
    } else {
      await saveNew(payload);
      location.href = '/pages/voluntarios/voluntarios-admin.html';
    }
  } catch (err) {
    errBx.classList.remove('d-none'); errBx.textContent = err?.message || 'Error al guardar';
  } finally {
    btn.disabled = false; btn.innerHTML = EDIT ? '<i class="fas fa-save me-1"></i> Guardar cambios'
                                               : '<i class="fas fa-save me-1"></i> Guardar';
  }
}
