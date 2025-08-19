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
    loadInventario(term);
  });

  loadInventario();
});

const val = (o, k) => o?.[k] ?? o?.[k?.toUpperCase?.()] ?? o?.[k?.toLowerCase?.()] ?? '';
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

async function loadInventario(search = '') {
  const tbody  = document.getElementById('inventarioTableBody');
  const loader = document.getElementById('loadingIndicator');
  const noRes  = document.getElementById('noResults');

  tbody.innerHTML = '';
  noRes.classList.add('d-none');
  loader.classList.remove('d-none');

  try {
    let data = [];
    if (search) {
      try {
        data = await makeRequest('/inventario-search', 'POST', { search });
      } catch {
        data = await makeRequest('/inventario', 'GET');
        data = (Array.isArray(data) ? data : []).filter(r => {
          const hay = (k) => String(val(r,k)).toLowerCase().includes(search.toLowerCase());
          return hay('nombre') || hay('tipo') || hay('proveedor') || hay('fuente');
        });
      }
    } else {
      data = await makeRequest('/inventario', 'GET');
    }

    if (!Array.isArray(data) || data.length === 0) {
      noRes.classList.remove('d-none');
      return;
    }

    for (const it of data) {
      const id    = val(it,'id');
      const nombre= val(it,'nombre');
      const tipo  = val(it,'tipo');
      const cant  = val(it,'cantidad');
      const fin   = val(it,'fechaingreso') || val(it,'fechaIngreso');
      const fca   = val(it,'fechacaducidad') || val(it,'fechaCaducidad');
      const prov  = val(it,'proveedor');
      const fuente= val(it,'fuente'); // 'Compra' | 'Donación'

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(id)}</td>
        <td>${esc(nombre)}</td>
        <td>${esc(tipo)}</td>
        <td class="text-end">${esc(cant)}</td>
        <td>${esc(fmtDate(fin))}</td>
        <td>${esc(fca ? fmtDate(fca) : '—')}</td>
        <td>${esc(prov || '-')}</td>
        <td><span class="badge ${String(fuente).toLowerCase()==='donación'?'bg-info text-dark':'bg-secondary'}">${esc(fuente)}</span></td>
        <td class="text-nowrap">
          <a class="btn btn-sm btn-info me-1"
             href="/pages/inventario/detalle-inventario.html?id=${encodeURIComponent(id)}"
             title="Ver detalles"><i class="fas fa-eye"></i></a>
          <a class="btn btn-sm btn-warning me-1"
             href="/pages/inventario/editar-inventario.html?id=${encodeURIComponent(id)}"
             title="Editar"><i class="fas fa-edit"></i></a>
          <button class="btn btn-sm btn-danger" data-id="${id}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tbody.appendChild(tr);
    }

    // Eliminar
    tbody.querySelectorAll('button.btn-danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar este item del inventario?')) return;
        try {
          await makeRequest(`/inventario/${id}`, 'DELETE');
          await loadInventario((document.getElementById('searchInput')?.value || '').trim());
        } catch (err) {
          console.error(err);
          alert(err?.message || 'Error eliminando el item.');
        }
      });
    });

  } catch (err) {
    console.error('Error cargando inventario:', err);
    noRes.classList.remove('d-none');
  } finally {
    loader.classList.add('d-none');
  }
}
