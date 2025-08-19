import { makeRequest, normalizeRow } from '/js/utils.js';

let EDIT = false;
let ID = null;
let CURRENT_PASSWORD = '';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol) !== 1) { location.href='/index.html'; return; }

  const qs = new URLSearchParams(location.search);
  ID = qs.get('id'); EDIT = !!ID;

  const form   = document.getElementById('usuarioForm');
  const loader = document.getElementById('loadingIndicator');
  const errBx  = document.getElementById('errorSummary');

  if (EDIT) {
    loader?.classList?.remove('d-none');
    form?.classList?.add('d-none');
    try {
      const row = await makeRequest(`/usuarios/${ID}`, 'GET');
      const r = normalizeRow(row||{});
      document.getElementById('usuarioId')?.setAttribute('value', r.id);
      setVal('nombre', r.nombre);
      setVal('apellido', r.apellido);
      setVal('email', r.email);
      setVal('telefono', r.telefono || '');
      setVal('rol', r.rol);
      CURRENT_PASSWORD = r.password || ''; 
      const cancel = document.getElementById('cancelLink');
      if (cancel) cancel.href = '/pages/usuarios/usuarios.html';
    } catch (e) {
      errBx?.classList.remove('d-none'); errBx.textContent = e?.message || 'No fue posible cargar.';
    } finally {
      loader?.classList?.add('d-none'); form?.classList?.remove('d-none');
    }
  }

  form?.addEventListener('submit', onSubmit);
});

function setVal(id,v){ const el=document.getElementById(id); if (el) el.value = (v??''); }

function getPayload(){
  const p = {
    nombre: document.getElementById('nombre').value.trim(),
    apellido: document.getElementById('apellido').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefono: document.getElementById('telefono').value.trim() || null,
    rol: Number(document.getElementById('rol').value)
  };
  const pwdInput = document.getElementById('password');
  const newPwd = (pwdInput?.value || '').trim();
  p.password = EDIT ? (newPwd || CURRENT_PASSWORD) : newPwd; 
  return p;
}

function validate(p){
  const errs=[];
  if (!p.nombre) errs.push('Nombre es requerido');
  if (!p.apellido) errs.push('Apellido es requerido');
  if (!p.email) errs.push('Email es requerido');
  if (!EDIT && !p.password) errs.push('Contraseña es requerida');
  if (![2,1,3].includes(Number(p.rol))) errs.push('Rol inválido');
  if (errs.length) throw new Error(errs.join('. '));
}

async function saveNew(p){
  return await makeRequest('/usuarios', 'POST', p);
}
async function saveEdit(id,p){
  return await makeRequest(`/usuarios/${id}`, 'PUT', p);
}

async function onSubmit(e){
  e.preventDefault();
  const btn = (e.submitter || document.querySelector('#usuarioForm button[type="submit"]'));
  const errBx = document.getElementById('errorSummary');
  errBx.classList.add('d-none'); errBx.textContent = '';
  try {
    const payload = getPayload();
    validate(payload);
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';
    if (EDIT) {
      await saveEdit(ID, payload);
    } else {
      await saveNew(payload);
    }
    location.href = '/pages/usuarios/usuarios.html';
  } catch (err) {
    errBx.classList.remove('d-none'); errBx.textContent = err?.message || 'Error al guardar';
  } finally {
    btn.disabled = false; btn.innerHTML = EDIT ? '<i class="fas fa-save me-1"></i> Guardar cambios'
                                               : '<i class="fas fa-save me-1"></i> Guardar';
  }
}
