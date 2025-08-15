import { makeRequest, normalizeRow } from '/js/utils.js';

const val = (o,k)=> o?.[k] ?? o?.[k?.toUpperCase?.()] ?? o?.[k?.toLowerCase?.()] ?? '';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol) !== 1) { location.href='/index.html'; return; }

  const form = document.getElementById('searchForm');
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const q = (document.getElementById('searchInput')?.value || '').trim();
    load(q);
  });

  load('');
});

async function fetchAll() {
  try {
    try { return await makeRequest('/api/historial-medico', 'GET'); }
    catch { return await makeRequest('/historial-medico', 'GET'); }
  } catch { return []; }
}

async function delRow(id) {
  try {
    try { await makeRequest(`/api/historial-medico/${id}`, 'DELETE'); }
    catch { await makeRequest(`/historial-medico/${id}`, 'DELETE'); }
  } catch (e) { throw e; }
}

async function load(search='') {
  const tbody = document.getElementById('historialTableBody');
  const noRes = document.getElementById('noResults');
  const loader= document.getElementById('loadingIndicator');
  tbody.innerHTML = ''; noRes.classList.add('d-none'); loader.classList.remove('d-none');

  try {
    let rows = await fetchAll();
    rows = Array.isArray(rows) ? rows.map(normalizeRow) : [];

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r=>{
        const m = String(val(r,'mascota'));
        const d = String(val(r,'diagnostico')).toLowerCase();
        const v = String(val(r,'veterinario')).toLowerCase();
        return m.includes(q) || d.includes(q) || v.includes(q);
      });
    }

    if (!rows.length) { noRes.classList.remove('d-none'); return; }

    for (const r of rows) {
      const tr = document.createElement('tr');
      const fechaTxt = r.fecha ? new Date(r.fecha).toLocaleDateString() : '-';
      const badgeCls = (r.estado==='Activo'?'bg-success':'bg-secondary');
      tr.innerHTML = `
        <td>${val(r,'id')}</td>
        <td>#${val(r,'mascota')}</td>
        <td>${fechaTxt}</td>
        <td>${(val(r,'diagnostico')||'-')}</td>
        <td>${(val(r,'veterinario')||'-')}</td>
        <td><span class="badge ${badgeCls}">${val(r,'estado')||'-'}</span></td>
        <td>
          <a class="btn btn-sm btn-info me-1" href="/pages/historial/detalle-historial.html?id=${encodeURIComponent(val(r,'id'))}">
            <i class="fas fa-eye"></i>
          </a>
          <a class="btn btn-sm btn-warning me-1" href="/pages/historial/editar-historial.html?id=${encodeURIComponent(val(r,'id'))}">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger" data-id="${val(r,'id')}"><i class="fas fa-trash"></i></button>
        </td>`;
      tbody.appendChild(tr);
    }

    tbody.querySelectorAll('button.btn-danger').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar este registro médico?')) return;
        try { await delRow(id); await load(search); }
        catch (err) { alert(err?.message || 'No fue posible eliminar'); }
      });
    });

  } finally {
    loader.classList.add('d-none');
  }
}
