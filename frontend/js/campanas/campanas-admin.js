// frontend/js/campanas/campanas-admin.js
import { makeRequest, normalizeRow } from '../utils.js';

function val(o, k) {
  return o?.[k] ?? o?.[k.toUpperCase()] ?? o?.[k.toLowerCase()] ?? '';
}
function escapeHtml(str) {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.rol !== 1) {
    window.location.href = '/index.html';
    return;
  }

  const form = document.getElementById('searchForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = (document.getElementById('searchInput')?.value || '').trim();
    loadCampanas(term);
  });

  loadCampanas();
});

async function loadCampanas(search = '') {
  try {
    const tbody = document.getElementById('campanasTableBody');
    const noResults = document.getElementById('noResults');
    if (tbody) tbody.innerHTML = '';

    let data = [];
    if (search) {
      // si tu backend usa /api, cambia a /api/campanas-search
      data = await makeRequest(`/campanas-search`, 'POST', { search });
    } else {
      // si tu backend usa /api, cambia a /api/campanas
      data = await makeRequest(`/campanas`, 'GET');
    }

    if (!Array.isArray(data) || data.length === 0) {
      noResults?.classList.remove('d-none');
      return;
    }
    noResults?.classList.add('d-none');

    data.forEach((c) => {
      const row = normalizeRow(c);
      const id = val(row,'id');
      const nombre = val(row,'nombre');
      const estado = val(row,'estado');
      const objetivo = Number(val(row,'objetivo') || 0);
      const fin = val(row,'fechafin') || val(row,'fin') || '';
      const ini = val(row,'fechainicio') || val(row,'inicio') || '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(String(id))}</td>
        <td>${escapeHtml(nombre)}</td>
        <td><span class="badge ${estado === 'Activa' ? 'bg-success':'bg-secondary'}">${escapeHtml(estado || '-')}</span></td>
        <td>${isNaN(objetivo) ? '-' : objetivo.toLocaleString()}</td>
        <td>${escapeHtml((ini||'').toString().slice(0,10))}</td>
        <td>${escapeHtml((fin||'').toString().slice(0,10))}</td>
        <td class="text-nowrap">
          <!-- NUEVO: Ver detalles -->
          <a class="btn btn-sm btn-info me-1"
             href="/pages/campanas/detalle-campana.html?id=${encodeURIComponent(id)}"
             title="Ver detalles">
            <i class="fas fa-eye"></i>
          </a>
          <!-- Editar -->
          <a class="btn btn-sm btn-warning me-1"
             href="/pages/campanas/editar-campana.html?id=${encodeURIComponent(id)}"
             title="Editar">
            <i class="fas fa-edit"></i>
          </a>
          <!-- Eliminar -->
          <button class="btn btn-sm btn-danger" data-id="${escapeHtml(String(id))}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // eliminar
    document.querySelectorAll('#campanasTableBody button.btn-danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar esta campaña? (Solo si no tiene donaciones)')) return;
        try {
          // si tu backend usa /api, cambia a /api/campanas/${id}
          await makeRequest(`/campanas/${id}`, 'DELETE');
          await loadCampanas((document.getElementById('searchInput')?.value || '').trim());
        } catch (err) {
          console.error(err);
          alert(err?.message || 'Error eliminando la campaña.');
        }
      });
    });

  } catch (err) {
    console.error('Error cargando campañas:', err);
    document.getElementById('noResults')?.classList.remove('d-none');
  }
}
