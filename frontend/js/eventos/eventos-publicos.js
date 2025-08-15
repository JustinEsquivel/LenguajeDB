// frontend/js/eventos/eventos-publicos.js
import { makeRequest, normalizeRow } from '../utils.js';

const grid  = document.getElementById('eventosContainer');
const form  = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const loading = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');

function cardHTML(row){
  const fechaTxt = row.fecha ? new Date(row.fecha).toLocaleString() : '-';
  const ubic = row.tipo === 'Virtual' ? 'En línea' : (row.ubicacion || 'Por definir');
  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title mb-1">${row.nombre}</h5>
          <span class="badge ${row.estado==='En curso'?'bg-success':(row.estado==='Planificado'?'bg-primary':'bg-secondary')}">${row.estado}</span>
          <p class="mb-1"><strong>Fecha:</strong> ${fechaTxt}</p>
          <p class="mb-1"><strong>Tipo:</strong> ${row.tipo}</p>
          <p class="mb-2"><strong>Ubicación:</strong> ${ubic}</p>
          <p class="text-muted">${row.descripcion ? (row.descripcion.length>90?row.descripcion.slice(0,90)+'…':row.descripcion) : 'Sin descripción'}</p>
        </div>
        <div class="card-footer bg-white border-0">
          <a href="/pages/eventos/detalle-evento.html?id=${row.id}" class="btn btn-primary btn-sm">
            <i class="fas fa-info-circle me-1"></i> Ver detalles
          </a>
        </div>
      </div>
    </div>`;
}

async function load(nombre='') {
  grid.innerHTML = '';
  noResults.classList.add('d-none');
  loading.classList.remove('d-none');

  const fetchJson = async (url) => {
    try {
      const data = await makeRequest(url, 'GET');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  try {
    const q = nombre ? `?NOMBRE=${encodeURIComponent(nombre)}` : '';
    // 1) Intento endpoint público
    let items = await fetchJson(`/api/eventos-publicos${q}`);

    // 2) Fallback: traer todos y filtrar en cliente
    if (!items.length) {
      const all = await fetchJson('/api/eventos');
      const term = (nombre || '').toLowerCase().trim();
      items = all
        .map(r => normalizeRow(r))
        .filter(e => {
          const est = (e.estado || '').toLowerCase();
          const okEstado = est === 'planificado' || est === 'en curso';
          const okNombre = !term || (String(e.nombre || '').toLowerCase().includes(term));
          return okEstado && okNombre;
        });
    }

    if (!items.length) {
      noResults.classList.remove('d-none');
      return;
    }

    const rows = items.map(r => normalizeRow(r));
    grid.innerHTML = rows.map(cardHTML).join('');
  } catch (e) {
    console.error(e);
    noResults.classList.remove('d-none');
  } finally {
    loading.classList.add('d-none');
  }
}


form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  load((input.value||'').trim());
});

document.getElementById('reloadBtn')?.addEventListener('click', ()=> load());

load();