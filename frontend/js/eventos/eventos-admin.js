// /frontend/js/eventos/eventos-admin.js
import { makeRequest } from '../utils.js';

function esc(s=''){
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
function val(o,k){
  return o?.[k] ?? o?.[k?.toUpperCase?.()] ?? o?.[k?.toLowerCase?.()] ?? '';
}
function fmtFecha(v){
  if(!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return String(v).slice(0,10);
  return d.toLocaleDateString();
}
function badgeCls(estado=''){
  const e = String(estado).toLowerCase();
  if (e === 'en curso') return 'bg-success';
  if (e === 'planificado') return 'bg-primary';
  if (e === 'finalizado') return 'bg-secondary';
  return 'bg-light text-dark';
}

async function loadEventos(search=''){
  const tbody = document.getElementById('eventosTableBody');
  const noResults = document.getElementById('noResults');
  const loader = document.getElementById('loadingIndicator');

  if (tbody) tbody.innerHTML='';
  noResults?.classList.add('d-none');
  loader?.classList.remove('d-none');

  try {
    let data = [];
    if (search) {
      // Ajusta si tu backend usa otra ruta para búsqueda
      data = await makeRequest('/api/eventos-search', 'POST', { search });
    } else {
      data = await makeRequest('/api/eventos', 'GET');
    }

    if (!Array.isArray(data) || data.length === 0) {
      noResults?.classList.remove('d-none');
      return;
    }

    data.forEach(e => {
      const id   = val(e,'id');
      const nom  = val(e,'nombre');
      const fec  = val(e,'fecha');
      const tip  = val(e,'tipo');
      const est  = val(e,'estado');
      const resp = val(e,'responsable_nombre') || val(e,'responsable');
      const asis = val(e,'asistentes') || 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(nom)}</td>
        <td>${fmtFecha(fec)}</td>
        <td>${esc(tip)}</td>
        <td><span class="badge ${badgeCls(est)}">${esc(est || '-')}</span></td>
        <td>${esc(resp || '-')}</td>
        <td>${esc(String(asis))}</td>
        <td class="text-nowrap">
          <!-- Ver detalles -->
          <a class="btn btn-sm btn-info me-1"
             href="/pages/eventos/detalle-evento.html?id=${encodeURIComponent(id)}"
             title="Ver detalles">
            <i class="fas fa-eye"></i>
          </a>
          <!-- Editar -->
          <a class="btn btn-sm btn-warning me-1"
             href="/pages/eventos/editar-evento.html?id=${encodeURIComponent(id)}"
             title="Editar">
            <i class="fas fa-edit"></i>
          </a>
          <!-- Eliminar -->
          <button class="btn btn-sm btn-danger" data-id="${id}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tbody.appendChild(tr);
    });

    // Eliminar
    tbody.querySelectorAll('button.btn-danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar este evento?')) return;
        try {
          await makeRequest(`/api/eventos/${id}`, 'DELETE');
          await loadEventos((document.getElementById('searchInput')?.value || '').trim());
        } catch (err) {
          console.error(err);
          alert('Error eliminando el evento.');
        }
      });
    });

  } catch (err) {
    console.error('Error cargando eventos:', err);
    noResults?.classList.remove('d-none');
  } finally {
    loader?.classList.add('d-none');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol) !== 1) {
    window.location.href = '/index.html';
    return;
  }

  const form = document.getElementById('searchForm');
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const term = (document.getElementById('searchInput')?.value || '').trim();
    loadEventos(term);
  });

  loadEventos();
});
