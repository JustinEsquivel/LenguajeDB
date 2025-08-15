// frontend/js/mascotas/mascotas-form.js
import { makeRequest, getAuthData } from '../utils.js';

let MODO_EDIT = false;
let MASCOTA_ID = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  MASCOTA_ID = params.get('id');
  MODO_EDIT = !!MASCOTA_ID;

  const form = document.getElementById('mascotaForm');
  const loader = document.getElementById('loadingIndicator');
  const errorBox = document.getElementById('errorSummary');

  // Si es edición, carga datos
  if (MODO_EDIT) {
    document.getElementById('formTitle')?.classList.remove('d-none');
    try {
      loader?.classList.remove('d-none');
      const mascota = await makeRequest(`/mascotas/${MASCOTA_ID}`);
      // Rellena
      document.getElementById('mascotaId')?.setAttribute('value', mascota.id);
      document.getElementById('nombre').value = mascota.nombre || '';
      document.getElementById('raza').value = mascota.raza || '';
      document.getElementById('edad').value = mascota.edad ?? '';
      document.getElementById('descripcion').value = mascota.descripcion || '';
      document.getElementById('estado').value = mascota.estado || 'Disponible';
      if (document.getElementById('currentFoto')) {
        document.getElementById('currentFoto').innerHTML = mascota.foto
          ? `<img src="${mascota.foto}" class="img-thumbnail" style="max-width:200px">`
          : '<span class="text-muted">Sin foto</span>';
      }
      // link cancelar a detalle
      const cancel = document.getElementById('cancelLink');
      if (cancel) cancel.href = `detalle-mascota.html?id=${MASCOTA_ID}`;
    } catch (e) {
      errorBox?.classList.remove('d-none');
      errorBox.textContent = e.message || 'Error al cargar la mascota';
    } finally {
      loader?.classList.add('d-none');
      form?.classList.remove('d-none');
    }
  } else {
    // modo crear
    loader?.classList?.add('d-none');
    form?.classList.remove('d-none');
  }

  form?.addEventListener('submit', onSubmit);
});

function validate() {
  let ok = true;
  const errs = [];
  const req = ['nombre', 'raza', 'edad', 'descripcion', 'estado'];
  req.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) { ok = false; errs.push(`El campo ${id} es requerido`); el?.classList.add('is-invalid'); }
    else el.classList.remove('is-invalid');
  });
  const edad = Number(document.getElementById('edad').value);
  if (isNaN(edad) || edad < 0) { ok = false; errs.push('La edad debe ser un número positivo'); }
  if (!ok) {
    const box = document.getElementById('errorSummary');
    if (box) {
      box.innerHTML = '<ul>' + errs.map(x => `<li>${x}</li>`).join('') + '</ul>';
      box.classList.remove('d-none');
    }
  }
  return ok;
}

async function onSubmit(e) {
  e.preventDefault();
  const errorBox = document.getElementById('errorSummary');
  errorBox?.classList.add('d-none');

  if (!validate()) return;

  const user = getAuthData();
  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    raza: document.getElementById('raza').value.trim(),
    edad: Number(document.getElementById('edad').value),
    descripcion: document.getElementById('descripcion').value.trim(),
    estado: document.getElementById('estado').value,
    foto: document.getElementById('fotoUrl') ? document.getElementById('fotoUrl').value.trim() || null : null,
    usuario: user ? user.id : null
  };

  const btn = e.submitter || document.querySelector('#mascotaForm button[type="submit"]');
  try {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';

    if (MODO_EDIT) {
      await makeRequest(`/mascotas/${MASCOTA_ID}`, 'PUT', payload);
      window.location.href = `detalle-mascota.html?id=${MASCOTA_ID}&success=ok`;
    } else {
      await makeRequest('/mascotas', 'POST', payload);
      window.location.href = 'mascotas-disponibles.html';
    }
  } catch (e) {
    errorBox?.classList.remove('d-none');
    errorBox.textContent = e.message || 'Error al guardar';
  } finally {
    btn.disabled = false;
    btn.innerHTML = MODO_EDIT ? '<i class="fas fa-save me-1"></i> Guardar cambios' : '<i class="fas fa-plus-circle me-1"></i> Crear';
  }
}
