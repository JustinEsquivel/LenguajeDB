// /js/inventario/inventario-form.js
import { makeRequest, normalizeRow, getAuthData } from '../utils.js';

const $ = (id) => document.getElementById(id);

const toInputDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0,10);
  // fallback (YYYY-MM-DD o DD/MM/YYYY)
  const s = String(v).slice(0,10);
  const parts = s.includes('/') ? s.split('/') : s.split('-');
  let y,m,dd;
  if (s.includes('/')) { [dd,m,y] = parts.map(Number); }
  else { [y,m,dd] = parts.map(Number); }
  const t = new Date(y, (m||1)-1, dd||1);
  return Number.isNaN(t.getTime()) ? '' : t.toISOString().slice(0,10);
};

const toJsDate = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return null;
  const [y,m,d] = yyyy_mm_dd.split('-').map(n=>parseInt(n,10));
  return new Date(y, (m-1), d);
};

document.addEventListener('DOMContentLoaded', async () => {
  const u = getAuthData();
  if (!u || Number(u.rol) !== 1) {
    window.location.replace('/index.html'); return;
  }

  const params = new URLSearchParams(location.search);
  const ID = params.get('id');

  const form   = $('invForm');
  const loader = $('loadingIndicator');
  const errBox = $('errorSummary');

  if (ID) {
    // EDITAR
    try {
      loader?.classList.remove('d-none');
      form?.classList.add('d-none');
      const raw = await makeRequest(`/inventario/${encodeURIComponent(ID)}`, 'GET');
      const it  = normalizeRow(raw || {});
      $('itemId')?.setAttribute('value', it.id);
      $('nombre').value  = it.nombre || '';
      $('tipo').value    = it.tipo   || '';
      $('cantidad').value= it.cantidad ?? 0;
      $('fechaIngreso').value   = toInputDate(it.fechaIngreso || it.fechaingreso);
      $('fechaCaducidad').value = toInputDate(it.fechaCaducidad || it.fechacaducidad);
      $('proveedor').value= it.proveedor || '';
      $('fuente').value   = it.fuente || '';
      const cancel = $('cancelLink');
      if (cancel) cancel.href = `/pages/inventario/detalle-inventario.html?id=${encodeURIComponent(ID)}`;
      form?.classList.remove('d-none');
    } catch (e) {
      errBox.classList.remove('d-none');
      errBox.textContent = e?.message || 'No fue posible cargar el item';
    } finally {
      loader?.classList.add('d-none');
    }
  } else {
    // CREAR
    loader?.classList.add('d-none');
    form?.classList.remove('d-none');
  }

  form?.addEventListener('submit', onSubmit);
});

function validate() {
  const errs = [];
  const nombre = $('nombre')?.value?.trim();
  const tipo   = $('tipo')?.value?.trim();
  const cant   = Number($('cantidad')?.value);
  const fin    = $('fechaIngreso')?.value;
  const fuente = $('fuente')?.value;

  if (!nombre) errs.push('Nombre es obligatorio');
  if (!tipo)   errs.push('Tipo es obligatorio');
  if (Number.isNaN(cant) || cant < 0) errs.push('Cantidad debe ser un número ≥ 0');
  if (!fin)    errs.push('Fecha de ingreso es obligatoria');
  if (!fuente) errs.push('Fuente es obligatoria');
  if (fuente && !['Compra','Donación'].includes(fuente)) errs.push('Fuente inválida (Compra o Donación)');

  const box = $('errorSummary');
  if (errs.length) {
    box.innerHTML = '<ul class="mb-0">' + errs.map(e=>`<li>${e}</li>`).join('') + '</ul>';
    box.classList.remove('d-none');
    return false;
  }
  box.classList.add('d-none');
  return true;
}

async function onSubmit(e) {
  e.preventDefault();
  if (!validate()) return;

  const params = new URLSearchParams(location.search);
  const ID = params.get('id');
  const btn = e.submitter || document.querySelector('#invForm button[type="submit"]');
  const errBox = $('errorSummary');

  const payload = {
    nombre: $('nombre').value.trim(),
    tipo: $('tipo').value.trim(),
    cantidad: Number($('cantidad').value),
    fechaIngreso: toJsDate($('fechaIngreso').value),           // JS Date → oracledb bind
    fechaCaducidad: $('fechaCaducidad').value ? toJsDate($('fechaCaducidad').value) : null,
    proveedor: $('proveedor').value.trim() || null,
    fuente: $('fuente').value
  };

  try {
    btn.disabled = true;
    btn.innerHTML = ID ? '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...'
                       : '<i class="fas fa-spinner fa-spin me-1"></i> Creando...';

    if (ID) {
      await makeRequest(`/inventario/${encodeURIComponent(ID)}`, 'PUT', payload);
      location.href = `/pages/inventario/detalle-inventario.html?id=${encodeURIComponent(ID)}&ok=1`;
    } else {
      const created = await makeRequest('/inventario', 'POST', payload);
      const newId = created?.id;
      location.href = `/pages/inventario/detalle-inventario.html?id=${encodeURIComponent(newId)}`;
    }
  } catch (e) {
    let msg = e?.message || e?.error || 'Error al guardar';
    if (String(msg).includes('-30001')) msg = 'Fuente inválida. Debe ser Compra o Donación.';
    errBox.textContent = msg;
    errBox.classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.innerHTML = ID ? '<i class="fas fa-save me-1"></i> Guardar cambios'
                       : '<i class="fas fa-plus-circle me-1"></i> Crear';
  }
}
