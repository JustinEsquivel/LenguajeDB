import { makeRequest, checkAuth, getAuthData } from '../utils.js';

document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  const form = document.getElementById('mascotaForm');
  form.addEventListener('submit', handleMascotaSubmit);
});

async function handleMascotaSubmit(e) {
  e.preventDefault();
  if (!validate()) return;

  const user = getAuthData();
  const payload = {
    nombre: document.getElementById('nombre').value,
    raza: document.getElementById('raza').value,
    edad: Number(document.getElementById('edad').value),
    descripcion: document.getElementById('descripcion').value,
    estado: document.getElementById('estado').value,
    usuario: user ? user.id : null,
    foto: document.getElementById('fotoUrl') ? document.getElementById('fotoUrl').value : null
  };

  const btn = document.querySelector('#mascotaForm button[type="submit"]');
  try {
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Procesando...';
    await makeRequest('/mascotas', 'POST', payload);
    alert('Mascota creada exitosamente!');
    window.location.href = 'mascotasDisponibles.html';
  } catch (e) {
    document.getElementById('errorSummary').textContent = e.message;
    document.getElementById('errorSummary').classList.remove('d-none');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus-circle me-1"></i> Crear';
  }
}

function validate() {
  let ok = true;
  const errs = [];
  const req = ['nombre','raza','edad','descripcion'];
  req.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value) { ok = false; errs.push(`El campo ${id} es requerido`); }
  });
  const edad = Number(document.getElementById('edad').value);
  if (isNaN(edad) || edad < 0) { ok = false; errs.push('La edad debe ser positiva'); }
  if (!ok) {
    document.getElementById('errorSummary').innerHTML = '<ul>' + errs.map(x=>`<li>${x}</li>`).join('') + '</ul>';
    document.getElementById('errorSummary').classList.remove('d-none');
  }
  return ok;
}
