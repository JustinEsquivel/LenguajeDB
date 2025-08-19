import { makeRequest } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol) !== 1) {
    window.location.replace('/index.html');
    return;
  }

  const form = document.getElementById('searchForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = (document.getElementById('searchInput')?.value || '').trim();
    loadMascotas(term);
  });

  loadMascotas();
});

function val(o, k) {
  return o?.[k] ?? o?.[k?.toUpperCase?.()] ?? o?.[k?.toLowerCase?.()] ?? '';
}
function esc(str = '') {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

async function loadMascotas(search = '') {
  const tbody = document.querySelector('#tablaMascotas tbody');     
  const noMsg = document.getElementById('noMascotas');              
  const loader = document.getElementById('loadingIndicator');

  if (tbody) tbody.innerHTML = '';
  noMsg?.classList.add('d-none');
  loader?.classList.remove('d-none');

  try {
    let data = [];
    if (search) {
      data = await makeRequest('/mascotas-search', 'POST', { search });
    } else {
      data = await makeRequest('/mascotas', 'GET');
    }

    if (!Array.isArray(data) || data.length === 0) {
      noMsg?.classList.remove('d-none');
      return;
    }

    data.forEach((m) => {
      const id       = val(m, 'id');
      const nombre   = val(m, 'nombre');
      const raza     = val(m, 'raza');
      const edad     = val(m, 'edad');
      const estado   = val(m, 'estado');
      const usuarioN = val(m, 'usuario_nombre') || val(m, 'usuario') || '-';

      const badge = (String(estado).toLowerCase() === 'disponible') ? 'bg-success' : 'bg-secondary';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(id)}</td>
        <td>${esc(nombre)}</td>
        <td>${esc(raza)}</td>
        <td>${esc(edad ?? '-')}</td>
        <td><span class="badge ${badge}">${esc(estado)}</span></td>
        <td>${esc(usuarioN)}</td>
        <td class="text-nowrap">
          <a class="btn btn-sm btn-info me-1"
             href="/pages/mascotas/detalle-mascota.html?id=${encodeURIComponent(id)}"
             title="Ver detalles">
            <i class="fas fa-eye"></i>
          </a>
          <a class="btn btn-sm btn-warning me-1"
             href="/pages/mascotas/editar-mascota.html?id=${encodeURIComponent(id)}"
             title="Editar">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger" data-id="${id}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Eliminar
    tbody.querySelectorAll('button.btn-danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar esta mascota?')) return;
        try {
          await makeRequest(`/mascotas/${id}`, 'DELETE'); 
          await loadMascotas((document.getElementById('searchInput')?.value || '').trim());
        } catch (err) {
          console.error(err);
          alert('Error eliminando la mascota.');
        }
      });
    });

  } catch (err) {
    console.error('Error cargando mascotas:', err);
    noMsg?.classList.remove('d-none');
  } finally {
    loader?.classList.add('d-none');
  }
}
