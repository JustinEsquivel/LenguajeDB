import { makeRequest, normalizeRow } from '/js/utils.js';

const val = (o,k)=> o?.[k] ?? o?.[k?.toUpperCase?.()] ?? o?.[k?.toLowerCase?.()] ?? '';
const esc = (s='') => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

const roleLabel = r => ({ 1:'Admin', 3:'Voluntario', 0:'Usuario' }[Number(r)] || `Rol ${r}`);
const roleBadge = r => {
  const n = Number(r);
  if (n === 1) return '<span class="badge bg-dark">Admin</span>';
  if (n === 3) return '<span class="badge bg-info text-dark">Voluntario</span>';
  return '<span class="badge bg-secondary">Usuario</span>';
};

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol) !== 1) { location.href='/index.html'; return; }

  const form = document.getElementById('searchForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = (document.getElementById('searchInput')?.value || '').trim();
    loadUsuarios(term);
  });

  loadUsuarios();
});

async function loadUsuarios(search = '') {
  const tbody = document.getElementById('usuariosTableBody');
  const noRes = document.getElementById('noResults');
  const loader= document.getElementById('loadingIndicator');
  if (tbody) tbody.innerHTML = ''; noRes?.classList.add('d-none'); loader?.classList.remove('d-none');

  try {
    let rows = await makeRequest('/usuarios', 'GET'); // utils añade /api
    rows = Array.isArray(rows) ? rows.map(normalizeRow) : [];

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => {
        const full = `${val(r,'nombre')} ${val(r,'apellido')}`.toLowerCase();
        const email = String(val(r,'email')).toLowerCase();
        const tel   = String(val(r,'telefono')).toLowerCase();
        const rolLb = roleLabel(val(r,'rol')).toLowerCase();
        return full.includes(q) || email.includes(q) || tel.includes(q) || rolLb.includes(q);
      });
    }

    if (!rows.length) { noRes?.classList.remove('d-none'); return; }

    for (const r of rows) {
      const id    = val(r,'id');
      const name  = `${val(r,'nombre')} ${val(r,'apellido')}`.trim();
      const email = val(r,'email');
      const tel   = val(r,'telefono') || '-';
      const rol   = roleBadge(val(r,'rol'));

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${esc(id)}</td>
        <td>${esc(name)}</td>
        <td>${esc(email)}</td>
        <td>${esc(tel)}</td>
        <td>${rol}</td>
        <td class="text-nowrap">
          <a class="btn btn-sm btn-info me-1" href="/pages/usuarios/detalle-usuario.html?id=${encodeURIComponent(id)}" title="Ver">
            <i class="fas fa-eye"></i>
          </a>
          <a class="btn btn-sm btn-warning me-1" href="/pages/usuarios/editar-usuario.html?id=${encodeURIComponent(id)}" title="Editar">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-danger" data-id="${id}" title="Eliminar"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Eliminar
    tbody.querySelectorAll('button.btn-danger').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = e.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('¿Eliminar este usuario?')) return;
        try {
          await makeRequest(`/usuarios/${id}`, 'DELETE');
          await loadUsuarios((document.getElementById('searchInput')?.value || '').trim());
        } catch (err) {
          alert(err?.message || 'No fue posible eliminar.');
        }
      });
    });

  } finally {
    loader?.classList.add('d-none');
  }
}
