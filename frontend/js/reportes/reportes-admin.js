// /frontend/js/reportes/reportes-admin.js
import { makeRequest, normalizeRow } from '../utils.js';

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
    loadReportes(term);
  });

  loadReportes();
});

function escapeHtml(str='') {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function val(o, k) {
  return o?.[k] ?? o?.[k.toUpperCase()] ?? o?.[k.toLowerCase()] ?? '';
}

function toIso(d = new Date()){
  const p = (n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

function fmtDate(v){
  if (!v) return '';
  if (v instanceof Date && !isNaN(v)) return toIso(v);
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return isNaN(d) ? s.slice(0,10) : toIso(d);
}

async function loadReportes(search='') {
  const tbody = document.getElementById('reportesTableBody');
  const noResults = document.getElementById('noResults');
  tbody.innerHTML = '';
  noResults.classList.add('d-none');

  try {
    const data = await makeRequest('/reportes', 'GET');
    if (!Array.isArray(data) || data.length === 0) {
      noResults.classList.remove('d-none');
      return;
    }

    // Filtro simple en cliente
    const term = search.toLowerCase();
    const rows = data
      .map(normalizeRow)
      .filter(r => !term || [
        r.provincia, r.canton, r.distrito, r.detalles, r.id, r.mascota, r.usuario
      ].some(x => String(x ?? '').toLowerCase().includes(term)));

    if (!rows.length) {
      noResults.classList.remove('d-none');
      return;
    }

    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(String(r.id))}</td>
        <td>${fmtDate(r.fecha)}</td>
        <td>${escapeHtml(String(r.usuario ?? '-'))}</td>
        <td>${escapeHtml(String(r.mascota ?? '-'))}</td>
        <td>${escapeHtml(r.provincia || '-')}</td>
        <td>${escapeHtml(r.canton || '-')}</td>
        <td>${escapeHtml(r.distrito || '-')}</td>
        <td>${escapeHtml((r.detalles || '').slice(0,60))}${(r.detalles||'').length>60?'…':''}</td>
        <td class="text-nowrap">
          <a class="btn btn-sm btn-primary me-1" href="/pages/reportes/detalle-reporte.html?id=${encodeURIComponent(r.id)}">
            <i class="fas fa-eye"></i>
          </a>
          <a class="btn btn-sm btn-warning me-1" href="/pages/reportes/editar-reporte.html?id=${encodeURIComponent(r.id)}">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger" data-id="${r.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // eliminar
    tbody.querySelectorAll('button.btn-danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar este reporte?')) return;
        try {
          await makeRequest(`/reportes/${id}`, 'DELETE');
          await loadReportes(search);
        } catch (err) {
          alert('Error eliminando el reporte: ' + (err.message || ''));
        }
      });
    });

  } catch (err) {
    console.error('Error cargando reportes:', err);
    noResults.classList.remove('d-none');
  }
}
