// ES Module
import { makeRequest, normalizeRow } from '/js/utils.js';

const val = (o,k)=> o?.[k] ?? o?.[k?.toUpperCase?.()] ?? o?.[k?.toLowerCase?.()] ?? '';
const esc = (s='') => String(s)
  .replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;')
  .replaceAll("'",'&#39;');

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
    loadVoluntarios(term);
  });

  loadVoluntarios('');
});

async function fetchActivos() {
  try {
    try { return await makeRequest('/api/voluntarios/activos', 'GET'); }
    catch { return await makeRequest('/voluntarios/activos', 'GET'); }
  } catch { return []; }
}

async function delVol(id) {
  try {
    try { await makeRequest(`/api/voluntarios/${id}`, 'DELETE'); }
    catch { await makeRequest(`/voluntarios/${id}`, 'DELETE'); }
  } catch (e) { throw e; }
}

function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d).slice(0,10);
  return dt.toLocaleDateString();
}

async function loadVoluntarios(search='') {
  const tbody  = document.getElementById('voluntariosTableBody');
  const noMsg  = document.getElementById('noVoluntarios');
  const loader = document.getElementById('loadingIndicator');
  if (tbody) tbody.innerHTML = '';
  noMsg?.classList.add('d-none');
  loader?.classList.remove('d-none');

  try {
    let rows = await fetchActivos();
    rows = Array.isArray(rows) ? rows.map(normalizeRow) : [];

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => {
        const id  = String(val(r,'id')).toLowerCase();
        const uid = String(val(r,'usuario')).toLowerCase();
        const est = String(val(r,'estado')).toLowerCase();
        return id.includes(q) || uid.includes(q) || est.includes(q);
      });
    }

    if (!rows.length) { noMsg?.classList.remove('d-none'); return; }

    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(val(r,'id'))}</td>
        <td>${esc(val(r,'usuario'))}</td>
        <td>${esc(fmtDate(val(r,'fechainicio')))}</td>
        <td>${esc(fmtDate(val(r,'fechafin')))}</td>
        <td>${esc(val(r,'horas') ?? 0)}</td>
        <td><span class="badge ${String(val(r,'estado'))==='Activo'?'bg-success':'bg-secondary'}">${esc(val(r,'estado'))}</span></td>
        <td class="text-nowrap">
          <a class="btn btn-sm btn-info me-1"
             href="/pages/voluntarios/detalle-voluntario.html?id=${encodeURIComponent(val(r,'id'))}"
             title="Ver detalles">
            <i class="fas fa-eye"></i>
          </a>
          <a class="btn btn-sm btn-warning me-1"
             href="/pages/voluntarios/editar-voluntario.html?id=${encodeURIComponent(val(r,'id'))}"
             title="Editar">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger" data-id="${esc(val(r,'id'))}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tbody.appendChild(tr);
    }

    tbody.querySelectorAll('button.btn-danger').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar este voluntario?')) return;
        try { await delVol(id); await loadVoluntarios((document.getElementById('searchInput')?.value||'').trim()); }
        catch (err) { alert(err?.message || 'No fue posible eliminar'); }
      });
    });

  } finally {
    loader?.classList?.add('d-none');
  }
}
