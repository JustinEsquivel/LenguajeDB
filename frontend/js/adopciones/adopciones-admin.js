// /js/adopciones/adopciones-admin.js
import { makeRequest } from '/js/utils.js';

const val = (o, k) => o?.[k] ?? o?.[k.toUpperCase()] ?? o?.[k.toLowerCase()] ?? '';

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
    loadAdopciones(term);
  });

  loadAdopciones();
});

async function loadAdopciones(search = '') {
  const tbody = document.getElementById('adopcionesTableBody');
  const noResults = document.getElementById('noResults');
  const loader = document.getElementById('loadingIndicator');

  tbody.innerHTML = '';
  noResults.classList.add('d-none');
  loader.classList.remove('d-none');

  try {
    const data = await makeRequest(`/api/adopciones`, 'GET');
    let rows = Array.isArray(data) ? data : [];

    // filtro cliente: por id / usuario / mascota (string includes)
    const term = search.toLowerCase();
    if (term) {
      rows = rows.filter(a => {
        const id = String(val(a, 'id'));
        const usuario = String(val(a, 'usuario'));
        const mascota = String(val(a, 'mascota'));
        return id.includes(term) || usuario.includes(term) || mascota.includes(term);
      });
    }

    if (!rows.length) {
      noResults.classList.remove('d-none');
      return;
    }

    for (const a of rows) {
      const id  = val(a, 'id');
      const fec = val(a, 'fecha'); // puede venir como ISO o fecha oracle serializada por driver
      const fechaTxt = fec ? new Date(fec).toLocaleDateString() : '-';
      const mascota = val(a, 'mascota');
      const usuario = val(a, 'usuario');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(id)}</td>
        <td>${escapeHtml(fechaTxt)}</td>
        <td>#${escapeHtml(mascota)}</td>
        <td>#${escapeHtml(usuario)}</td>
        <td>
          <a class="btn btn-sm btn-info me-1" href="/pages/adopciones/detalle-adopcion.html?id=${encodeURIComponent(id)}">
            <i class="fas fa-eye"></i>
          </a>
          <a class="btn btn-sm btn-warning me-1" href="/pages/adopciones/editar-adopcion.html?id=${encodeURIComponent(id)}">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger" data-id="${id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tbody.appendChild(tr);
    }

    // eliminar (revertir)
    tbody.querySelectorAll('button.btn-danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Revertir esta adopción? La mascota volverá a "Disponible".')) return;
        try {
          await makeRequest(`/api/adopciones/${id}`, 'DELETE');
          await loadAdopciones(search);
        } catch (err) {
          console.error(err);
          alert(err?.message || 'Error revirtiendo adopción.');
        }
      });
    });

  } catch (err) {
    console.error('Error cargando adopciones:', err);
    noResults.classList.remove('d-none');
  } finally {
    loader.classList.add('d-none');
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
