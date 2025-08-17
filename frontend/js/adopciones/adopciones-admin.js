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

    // 1) Armar set de IDs únicos
    const mIds = new Set();
    const uIds = new Set();
    for (const a of rows) {
      const mid = String(val(a, 'mascota') || '').trim();
      const uid = String(val(a, 'usuario') || '').trim();
      if (mid) mIds.add(mid);
      if (uid) uIds.add(uid);
    }

    // 2) Resolver nombres (si la API ya los manda, se usan; si no, se consulta por ID)
    const [mMap, uMap] = await Promise.all([
      getMascotaMap([...mIds]),
      getUsuarioMap([...uIds]),
    ]);

    // 3) Filtro por ID o por NOMBRE resuelto
    const term = search.toLowerCase();
    if (term) {
      rows = rows.filter(a => {
        const id = String(val(a, 'id'));
        const mName = String(val(a, 'mascota_nombre') || mMap.get(String(val(a,'mascota'))) || '').toLowerCase();
        const uName = String(val(a, 'usuario_nombre') || uMap.get(String(val(a,'usuario'))) || '').toLowerCase();
        return id.includes(term) || mName.includes(term) || uName.includes(term);
      });
    }

    if (!rows.length) {
      noResults.classList.remove('d-none');
      return;
    }

    // 4) Render
    for (const a of rows) {
      const id  = val(a, 'id');
      const fec = val(a, 'fecha');
      const fechaTxt = fec ? new Date(fec).toLocaleDateString() : '-';

      const mascotaName = val(a, 'mascota_nombre') ||
                          mMap.get(String(val(a,'mascota'))) ||
                          String(val(a,'mascota')) || '-';

      const usuarioName = val(a, 'usuario_nombre') ||
                          uMap.get(String(val(a,'usuario'))) ||
                          String(val(a,'usuario')) || '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(id)}</td>
        <td>${escapeHtml(fechaTxt)}</td>
        <td>${escapeHtml(mascotaName)}</td>
        <td>${escapeHtml(usuarioName)}</td>
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

    // 5) Acciones
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

/* ---------- Resolutores de nombre (con pequeño caché) ---------- */
const mascotaCache = new Map();
const usuarioCache = new Map();

async function getMascotaMap(ids) {
  const map = new Map();
  const arr = ids.filter(Boolean);
  await Promise.all(arr.map(async (id) => {
    const key = String(id);
    if (mascotaCache.has(key)) { map.set(key, mascotaCache.get(key)); return; }
    try {
      // Ajusta la ruta si tu API no usa /api
      const m = await makeRequest(`/api/mascotas/${encodeURIComponent(key)}`, 'GET');
      const nombre = m?.nombre || key;
      mascotaCache.set(key, nombre);
      map.set(key, nombre);
    } catch {
      map.set(key, String(id)); // fallback: solo id, sin '#'
    }
  }));
  return map;
}

async function getUsuarioMap(ids) {
  const map = new Map();
  const arr = ids.filter(Boolean);
  await Promise.all(arr.map(async (id) => {
    const key = String(id);
    if (usuarioCache.has(key)) { map.set(key, usuarioCache.get(key)); return; }
    try {
      // Ajusta la ruta si tu API no usa /api
      const u = await makeRequest(`/api/usuarios/${encodeURIComponent(key)}`, 'GET');
      const nombre = [u?.nombre, u?.apellido].filter(Boolean).join(' ').trim() || u?.email || key;
      usuarioCache.set(key, nombre);
      map.set(key, nombre);
    } catch {
      map.set(key, String(id)); // fallback: solo id, sin '#'
    }
  }));
  return map;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
