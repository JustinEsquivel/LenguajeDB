import { makeRequest, normalizeRow } from '/js/utils.js';

const $ = id => document.getElementById(id);
const roleLabel = r => ({ 1:'Admin', 3:'Voluntario', 0:'Usuario' }[Number(r)] || `Rol ${r}`);

document.addEventListener('DOMContentLoaded', async ()=>{
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || Number(user.rol)!==1) { location.href='/index.html'; return; }

  const qs = new URLSearchParams(location.search);
  const id = qs.get('id');

  const loading = $('loadingIndicator');
  const card    = $('usuarioDetails');
  const errBox  = $('errorContainer');

  try {
    loading.classList.remove('d-none');
    const row = await makeRequest(`/usuarios/${id}`, 'GET');
    const r = normalizeRow(row || {});
    setTxt('id', r.id);
    setTxt('nombre', r.nombre || '-');
    setTxt('apellido', r.apellido || '-');
    setTxt('email', r.email || '-');
    setTxt('telefono', r.telefono || '-');
    setTxt('rol', roleLabel(r.rol));

    const edit = $('editLink'); if (edit) edit.href = `/pages/usuarios/editar-usuario.html?id=${encodeURIComponent(id)}`;

    $('btnEliminar').onclick = async ()=>{
      if (!confirm('¿Eliminar este usuario?')) return;
      try { 
        await makeRequest(`/usuarios/${id}`, 'DELETE'); 
        alert('Usuario eliminado'); 
        location.href='/pages/usuarios/usuarios.html'; 
      }
      catch(e){ alert(e?.message || 'No fue posible eliminar'); }
    };

    card.classList.remove('d-none');
  } catch (e) {
    errBox.classList.remove('d-none');
    errBox.querySelector('.error-message').textContent = e?.message || 'No fue posible cargar.';
  } finally {
    loading.classList.add('d-none');
  }
});

function setTxt(id,v){ const el=$(id); if (el) el.textContent = v; }
