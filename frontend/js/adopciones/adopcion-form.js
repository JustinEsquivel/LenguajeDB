// /js/adopciones/adopcion-form.js
import { makeRequest, getAuthData, normalizeRow } from '/js/utils.js';

const $ = (id) => document.getElementById(id);
const esc = (s='') => String(s)
  .replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;')
  .replaceAll("'",'&#39;');

let EDIT = false;
let ADOPCION_ID = null;

document.addEventListener('DOMContentLoaded', async ()=>{
  const u = getAuthData();
  if (!u || Number(u.rol) !== 1) {
    location.href = '/index.html';
    return;
  }

  const params = new URLSearchParams(location.search);
  ADOPCION_ID = params.get('id');
  EDIT = !!ADOPCION_ID;

  const form = $('adopcionForm');
  const loader = $('loadingIndicator');
  const errBox = $('errorSummary');

  if (EDIT) {
    $('loadingIndicator')?.classList.remove('d-none');
    form?.classList.add('d-none');
    // En modo editar: solo fecha editable; mascota/usuario deshabilitados
    const mascotaEl = $('mascota');
    const usuarioEl = $('usuario');
    if (mascotaEl) { mascotaEl.setAttribute('disabled', 'true'); }
    if (usuarioEl) { usuarioEl.setAttribute('disabled', 'true'); }

    try{
      const raw = await makeRequest(`/api/adopciones/${encodeURIComponent(ADOPCION_ID)}`, 'GET');
      const a = normalizeRow(raw || {});
      $('adopcionId')?.setAttribute('value', a.id);
      if ($('fecha')) $('fecha').value = a.fecha ? String(a.fecha).slice(0,10) : '';
      if (mascotaEl) mascotaEl.value = a.mascota ?? '';
      if (usuarioEl) usuarioEl.value = a.usuario ?? '';

      // link cancelar a detalle
      const cancel = $('cancelLink');
      if (cancel) cancel.href = `/pages/adopciones/detalle-adopcion.html?id=${encodeURIComponent(a.id)}`;

      form?.classList.remove('d-none');
    }catch(e){
      errBox?.classList.remove('d-none');
      errBox.textContent = e?.message || 'No fue posible cargar la adopción';
    }finally{
      loader?.classList.add('d-none');
    }
  } else {
    // crear
    loader?.classList.add('d-none');
    form?.classList.remove('d-none');
  }

  form?.addEventListener('submit', onSubmit);
});

function validate(){
  const err = [];
  const fecha = $('fecha')?.value?.trim();
  if (!fecha) err.push('La fecha es requerida');

  if (EDIT) {
    // nada más que validar
  } else {
    const mascota = Number($('mascota')?.value);
    const usuario = Number($('usuario')?.value);
    if (!mascota || mascota < 1) err.push('Mascota (ID) es requerido');
    if (!usuario || usuario < 1) err.push('Usuario (ID) es requerido');
  }

  const errBox = $('errorSummary');
  if (err.length) {
    errBox.innerHTML = '<ul class="mb-0">' + err.map(esc).map(x=>`<li>${x}</li>`).join('') + '</ul>';
    errBox.classList.remove('d-none');
    return false;
  }
  errBox.classList.add('d-none');
  return true;
}

async function onSubmit(e){
  e.preventDefault();
  if (!validate()) return;

  const form = $('adopcionForm');
  const btn = form.querySelector('button[type="submit"]');
  const errBox = $('errorSummary');

  try{
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';

    if (EDIT) {
      const fecha = $('fecha').value;
      await makeRequest(`/api/adopciones/${encodeURIComponent(ADOPCION_ID)}/fecha`, 'PUT', { fecha });
      location.href = `/pages/adopciones/detalle-adopcion.html?id=${encodeURIComponent(ADOPCION_ID)}&success=ok`;
    } else {
      const body = {
        fecha: $('fecha').value,                 // 'YYYY-MM-DD'
        mascota: Number($('mascota').value),
        usuario: Number($('usuario').value)
      };
      const created = await makeRequest('/api/adopciones', 'POST', body);
      alert('Adopción creada exitosamente.');
      const newId = created?.id;
      if (newId) location.href = `/pages/adopciones/detalle-adopcion.html?id=${encodeURIComponent(newId)}`;
      else location.href = '/pages/adopciones/adopciones-admin.html';
    }
  } catch (e){
    let msg = e?.message || e?.error || 'Error al guardar';
    // Mapea errores del paquete
    if (String(msg).includes('-28003')) msg = 'La mascota ya fue adoptada.';
    if (String(msg).includes('-28001')) msg = 'La mascota no existe.';
    if (String(msg).includes('-28002')) msg = 'El usuario no existe.';
    errBox.textContent = msg;
    errBox.classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.innerHTML = EDIT ? '<i class="fas fa-save me-1"></i> Guardar cambios'
                         : '<i class="fas fa-plus-circle me-1"></i> Crear';
  }
}
