import { makeRequest, normalizeRow } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  loadCampanasActivas();

  const form = document.getElementById('searchForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchTerm = (document.getElementById('searchInput')?.value || '').trim();
      loadCampanasActivas(searchTerm);
    });
  }
});

function pct(a, b) {
  const x = Number(a || 0), y = Number(b || 0);
  if (y <= 0) return 0;
  const p = Math.floor((x / y) * 100);
  return Math.max(0, Math.min(100, p));
}

function formatDate(val) {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0,10);
  } catch {}
  return String(val).slice(0,10);
}

async function loadCampanasActivas(searchTerm = '') {
  const container = document.getElementById('campanasContainer');
  const noResults = document.getElementById('noResults');
  const loader = document.getElementById('loadingIndicator');

  container.innerHTML = '';
  noResults.classList.add('d-none');
  loader.classList.remove('d-none');

  // 1er intento (usa buildUrl -> normalmente /api/campanas-activas)
  let url1 = '/campanas-activas';
  if (searchTerm) url1 += `?NOMBRE=${encodeURIComponent(searchTerm)}`;

  // 2º intento (URL absoluta, evita el builder por si hay montajes raros)
  const url2Base = 'http://localhost:5000/api/campanas-activas';
  const url2 = searchTerm ? `${url2Base}?NOMBRE=${encodeURIComponent(searchTerm)}` : url2Base;

  try {
    let data = [];

    try {
      console.log('[Campañas] Intento 1 =>', url1);
      data = await makeRequest(url1, 'GET');
    } catch (e1) {
      console.warn('[Campañas] Intento 1 falló:', e1?.message || e1);
      console.log('[Campañas] Intento 2 =>', url2);
      data = await makeRequest(url2, 'GET'); // absoluta (no pasa por buildUrl)
    }

    if (!Array.isArray(data) || data.length === 0) {
      noResults.classList.remove('d-none');
      return;
    }

    let items = data.map(d => normalizeRow(d));

    if (searchTerm) {
      const needle = searchTerm.toLowerCase();
      items = items.filter(c => (c.nombre || '').toLowerCase().includes(needle));
    }

    if (items.length === 0) {
      noResults.classList.remove('d-none');
      return;
    }

    container.innerHTML = items.map(c => {
      const recaudado = Number(c.recaudado || 0);
      const objetivo  = Number(c.objetivo || 0);
      const progress  = pct(recaudado, objetivo);
      const fin = formatDate(c.fechafin || c.fin);

      const desc = (c.descripcion || '').trim();
      const descShort = desc ? (desc.length > 120 ? desc.slice(0,120) + '…' : desc) : 'Sin descripción';

      return `
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-1">${escapeHtml(c.nombre || '-')}</h5>
              <span class="badge ${c.estado === 'Activa' ? 'bg-success' : 'bg-secondary'}">
                ${escapeHtml(c.estado || '-')}
              </span>
              <p class="mt-2 text-muted">${escapeHtml(descShort)}</p>

              <div class="mb-2">
                <div class="progress" title="Recaudado: ${recaudado.toLocaleString()} de ${objetivo.toLocaleString()}">
                  <div class="progress-bar" role="progressbar" style="width:${progress}%;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <small class="text-muted d-block mt-1">
                  ${recaudado.toLocaleString()} / ${objetivo.toLocaleString()}
                </small>
              </div>

              <p class="mb-1"><strong>Fin:</strong> ${escapeHtml(fin)}</p>
            </div>
            <div class="card-footer bg-white border-0">
              <a href="/pages/campanas/detalle-campana.html?id=${encodeURIComponent(c.id)}" class="btn btn-primary btn-sm">
                <i class="fas fa-info-circle me-1"></i> Ver detalles
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (e) {
    console.error('[Campañas] Error final:', e);
    noResults.classList.remove('d-none');
  } finally {
    loader.classList.add('d-none');
  }
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
