import { makeRequest, normalizeRow, getAuthData } from '../utils.js';

const $ = (id) => document.getElementById(id);
const esc = (s='') => String(s)
  .replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;')
  .replaceAll("'",'&#39;');

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString();
};

document.addEventListener('DOMContentLoaded', async () => {
  const user = getAuthData();
  if (!user || Number(user.rol) !== 1) {
  }

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  const loading = $('loadingIndicator');
  const error   = $('errorContainer');
  const retry   = error?.querySelector('.retry-btn');
  const details = $('itemDetails');

  const editLink = $('editLink');

  retry?.addEventListener('click', () => { error.classList.add('d-none'); load(); });

  async function load() {
    loading.classList.remove('d-none');
    details.classList.add('d-none');
    try {
      const raw = await makeRequest(`/inventario/${encodeURIComponent(id)}`, 'GET');
      const it  = normalizeRow(raw || {});
      $('id').textContent        = esc(it.id ?? '-');
      $('nombre').textContent    = esc(it.nombre || '-');
      $('tipo').textContent      = esc(it.tipo || '-');
      $('cantidad').textContent  = esc(it.cantidad ?? '-');
      $('ingreso').textContent   = esc(fmtDate(it.fechaIngreso || it.fechaingreso));
      $('caducidad').textContent = esc(it.fechaCaducidad || it.fechacaducidad ? fmtDate(it.fechaCaducidad || it.fechacaducidad) : '—');
      $('proveedor').textContent = esc(it.proveedor || '-');

      const fuente = (it.fuente || '').trim();
      const badgeCls = (fuente.toLowerCase()==='donación') ? 'badge bg-info text-dark' : 'badge bg-secondary';
      const fuenteEl = $('fuente');
      fuenteEl.textContent = fuente || '-';
      fuenteEl.className = badgeCls;

      if (user && Number(user.rol) === 1) {
        editLink.classList.remove('d-none');
        editLink.href = `/pages/inventario/editar-inventario.html?id=${encodeURIComponent(it.id)}`;
      }

      details.classList.remove('d-none');
    } catch (e) {
      error.classList.remove('d-none');
      error.querySelector('.error-message').textContent = e?.message || 'No fue posible cargar el item.';
    } finally {
      loading.classList.add('d-none');
    }
  }

  if (!id) {
    error.classList.remove('d-none');
    error.querySelector('.error-message').textContent = 'ID no proporcionado';
  } else {
    load();
  }
});
