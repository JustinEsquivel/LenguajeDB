import { makeRequest, getAuthData } from '/js/utils.js';

let EDIT = false;
let EVENTO_ID = null;

const $ = (id) => document.getElementById(id);
const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };

function show(el, on=true){ el?.classList.toggle('d-none', !on); }
function hide(el){ show(el, false); }

function escapeHtml(str='') {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function setDateTimeLocal(inputEl, value){
  if (!inputEl) return;
  if (!value) { inputEl.value = ''; return; }
  const d = (value instanceof Date) ? value : new Date(value);
  if (isNaN(d)) { inputEl.value = ''; return; }

  const pad = (n) => String(n).padStart(2,'0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth()+1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  inputEl.value = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toPayload(){
  return {
    nombre:      $('nombre').value.trim(),
    descripcion: $('descripcion').value.trim() || null,
    fecha:       $('fecha').value, 
    ubicacion:   $('ubicacion').value.trim() || null,
    responsable: Number($('responsable').value),
    tipo:        $('tipo').value,
    estado:      $('estado').value
  };
}

function validate(){
  const err = [];
  const req = ['nombre','fecha','tipo','estado','responsable'];

  req.forEach(id => {
    const el = $(id);
    const ok = !!(el && String(el.value).trim());
    el?.classList.toggle('is-invalid', !ok);
    if (!ok) err.push(`El campo ${id} es requerido`);
  });

  const tipo = $('tipo')?.value;
  if (tipo === 'Presencial') {
    const el = $('ubicacion');
    const ok = !!(el && String(el.value).trim());
    el?.classList.toggle('is-invalid', !ok);
    if (!ok) err.push('La ubicación es requerida para eventos Presenciales');
  }

  const resp = Number($('responsable')?.value);
  if (isNaN(resp) || resp <= 0) {
    $('responsable')?.classList.add('is-invalid');
    err.push('Responsable debe ser un ID de usuario válido');
  }

  if (err.length){
    const box = $('errorSummary');
    if (box){
      box.innerHTML = '<ul class="mb-0">'+ err.map(e=>`<li>${escapeHtml(e)}</li>`).join('') +'</ul>';
      show(box, true);
    }
    return false;
  }
  $('errorSummary')?.classList.add('d-none');
  return true;
}

async function loadEvento(id){
  const loader = $('loadingIndicator');
  const form = $('eventoForm');
  const errBox = $('errorSummary');

  show(loader, true);
  hide(form);
  errBox?.classList.add('d-none');
  errBox && (errBox.textContent = '');

  try{
    const data = await makeRequest(`/api/eventos/${encodeURIComponent(id)}`, 'GET');
    // Normaliza tolerando campos en minúsculas/mayúsculas
    const row = (obj => new Proxy(obj, {
      get(t, p){ return t[p] ?? t[String(p).toLowerCase()] ?? t[String(p).toUpperCase()]; }
    }))(data || {});

    $('eventoId').value = row.id;
    $('nombre').value   = row.nombre || '';
    $('descripcion').value = row.descripcion || '';
    setDateTimeLocal($('fecha'), row.fecha);
    $('ubicacion').value = row.ubicacion || '';
    $('responsable').value = row.responsable || row.responsable_id || '';

    $('tipo').value   = (row.tipo === 'Virtual' ? 'Virtual' : 'Presencial');
    $('estado').value = ['En curso','Planificado','Finalizado'].includes(row.estado) ? row.estado : 'Planificado';

    // link cancelar a detalle
    const cancel = $('cancelLink');
    if (cancel) cancel.href = `/pages/eventos/detalle-evento.html?id=${encodeURIComponent(row.id)}`;

    // mostrar form
    show(form, true);
  } catch (e){
    if (errBox){
      errBox.textContent = e?.message || 'No fue posible cargar el evento';
      show(errBox, true);
    }
  } finally {
    hide(loader);
  }
}

async function onSubmit(e){
  e.preventDefault();
  const form = $('eventoForm');
  const errBox = $('errorSummary');
  errBox?.classList.add('d-none');

  if (!validate()) return;

  const btn = form.querySelector('button[type="submit"]');
  const payload = toPayload();

  try{
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';

    if (EDIT){
      await makeRequest(`/api/eventos/${encodeURIComponent(EVENTO_ID)}`, 'PUT', payload);
      // Redirige a detalle
      location.href = `/pages/eventos/detalle-evento.html?id=${encodeURIComponent(EVENTO_ID)}&success=ok`;
    } else {
      const created = await makeRequest('/api/eventos', 'POST', payload);
      const newId = created?.id;
      if (newId) location.href = `/pages/eventos/detalle-evento.html?id=${encodeURIComponent(newId)}`;
      else location.href = '/pages/eventos/eventos-admin.html';
    }
  } catch (e){
    if (errBox){
      errBox.textContent = e?.message || 'Error al guardar';
      show(errBox, true);
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save me-1"></i> Guardar cambios';
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  // Solo admin
  const user = getAuthData();
  if (!user || Number(user.rol) !== 1) {
    location.href = '/index.html';
    return;
  }

  const params = new URLSearchParams(location.search);
  EVENTO_ID = params.get('id');
  EDIT = !!EVENTO_ID;

  // Cambia botón según modo
  const submitBtn = document.querySelector('#eventoForm button[type="submit"]');
  if (submitBtn) {
    submitBtn.innerHTML = EDIT
      ? '<i class="fas fa-save me-1"></i> Guardar cambios'
      : '<i class="fas fa-plus-circle me-1"></i> Crear';
  }

  // Pre-carga o muestra formulario vacío
  if (EDIT) {
    await loadEvento(EVENTO_ID);
  } else {
    $('loadingIndicator')?.classList.add('d-none');
    $('eventoForm')?.classList.remove('d-none');
  }

  $('eventoForm')?.addEventListener('submit', onSubmit);
});
