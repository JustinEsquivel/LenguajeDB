// ES Module
import { makeRequest, getAuthData } from '/js/utils.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Fecha por defecto = hoy (si el input está vacío)
  const f = document.getElementById('fecha');
  if (f && !f.value) f.value = todayISO();

  const form = document.getElementById('reporteForm');
  form?.addEventListener('submit', onSubmit);
});

async function onSubmit(e) {
  e.preventDefault();
  hideAlerts();

  const fecha     = (document.getElementById('fecha')?.value || '').trim();
  const provincia = (document.getElementById('provincia')?.value || '').trim();
  const canton    = (document.getElementById('canton')?.value || '').trim();
  const distrito  = (document.getElementById('distrito')?.value || '').trim();
  const detalles  = (document.getElementById('detalles')?.value || '').trim();
  const mascotaId = (document.getElementById('mascotaId')?.value || '').trim();

  // Validaciones básicas
  if (!fecha || !provincia || !canton || !distrito || !detalles) {
    return showErr('Por favor completa todos los campos requeridos.');
  }
  if (!DATE_RE.test(fecha)) {
    return showErr('La fecha debe tener formato YYYY-MM-DD.');
  }

  // Usuario: puede ser null (anónimo)
  const u = getAuthData();
  // Mascota: puede ser null (no registrada / calle). Si no es número, la forzamos a null
  const mascota =
    mascotaId && /^\d+$/.test(mascotaId) ? Number(mascotaId) : null;

  const payload = {
    fecha,                          // 'YYYY-MM-DD' (el backend hará TO_DATE)
    usuario: u ? Number(u.id) : null,
    mascota,                        // null si no hay mascota registrada
    provincia,
    canton,
    distrito,
    detalles
  };

  const btn = e.submitter || document.querySelector('#reporteForm button[type="submit"]');
  try {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    // utils.buildUrl('/reportes') => /api/reportes
    await makeRequest('/reportes', 'POST', payload);

    showOk('¡Reporte enviado! Gracias por ayudarnos 💚');
    document.getElementById('reporteForm')?.reset();
    const f = document.getElementById('fecha'); if (f) f.value = todayISO();
  } catch (err) {
    showErr(err?.message || 'No fue posible enviar el reporte.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Enviar reporte';
  }
}

function hideAlerts() {
  document.getElementById('msgOk')?.classList.add('d-none');
  document.getElementById('msgErr')?.classList.add('d-none');
}
function showOk(msg) {
  const el = document.getElementById('msgOk');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('d-none');
}
function showErr(msg) {
  const el = document.getElementById('msgErr');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('d-none');
}
