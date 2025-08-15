import { makeRequest, checkAuth, normalizeRow, showAlert, getAuthData } from '../utils.js';

document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadMascotaData();
  setupFormValidation();
});

async function loadMascotaData() {
  try {
    const mascotaId = new URLSearchParams(window.location.search).get('id');
    if (!mascotaId) throw new Error('ID de mascota no proporcionado');
    const mascota = normalizeRow(await makeRequest(`/mascotas/${mascotaId}`));
    populateForm(mascota);
  } catch (error) {
    console.error('Error al cargar datos:', error);
    showError();
  }
}

function populateForm(mascota) {
  document.getElementById('loadingIndicator').classList.add('d-none');
  document.getElementById('editMascotaForm').classList.remove('d-none');

  document.getElementById('mascotaId').value = mascota.id;
  document.getElementById('nombre').value = mascota.nombre;
  document.getElementById('raza').value = mascota.raza;
  document.getElementById('edad').value = mascota.edad;
  document.getElementById('descripcion').value = mascota.descripcion || '';
  document.getElementById('estado').value = mascota.estado;

  const fotoContainer = document.getElementById('currentFoto');
  if (mascota.foto) {
    fotoContainer.innerHTML = `<img src="${mascota.foto}" alt="Foto actual" class="img-thumbnail" style="max-width: 200px;">`;
  } else {
    fotoContainer.innerHTML = '<p class="text-muted">No hay foto actual</p>';
  }
}

function setupFormValidation() {
  const form = document.getElementById('editMascotaForm');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

      const mascotaId = document.getElementById('mascotaId').value;
      const payload = {
        nombre: document.getElementById('nombre').value,
        raza: document.getElementById('raza').value,
        edad: Number(document.getElementById('edad').value),
        descripcion: document.getElementById('descripcion').value,
        estado: document.getElementById('estado').value,
        foto: document.getElementById('fotoUrl') ? document.getElementById('fotoUrl').value : null,
        usuario: (getAuthData() || {}).id
      };

      await makeRequest(`/mascotas/${mascotaId}`, 'PUT', payload);
      window.location.href = `detalle-mascota.html?id=${mascotaId}&success=Mascota actualizada correctamente`;
    } catch (error) {
      console.error('Error al guardar:', error);
      document.getElementById('errorSummary').textContent = error.message;
      document.getElementById('errorSummary').classList.remove('d-none');
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    }
  });
}

function validateForm() {
  let isValid = true;
  const required = ['nombre','raza','edad','estado'];
  required.forEach(id => {
    const f = document.getElementById(id);
    if (!f.value.trim()) { f.classList.add('is-invalid'); isValid = false; }
    else f.classList.remove('is-invalid');
  });
  const edadField = document.getElementById('edad');
  if (isNaN(edadField.value) || parseInt(edadField.value) < 0) {
    edadField.classList.add('is-invalid'); isValid = false;
  }
  return isValid;
}

function showError() {
  document.getElementById('loadingIndicator').classList.add('d-none');
  document.getElementById('errorContainer').classList.remove('d-none');
}
