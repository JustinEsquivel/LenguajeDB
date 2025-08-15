// /js/adopciones/adopcion-detalle.js
import { makeRequest, getAuthData, normalizeRow } from '/js/utils.js';

const $ = (id) => document.getElementById(id);
const esc = (s='') => String(s)
  .replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;')
  .replaceAll("'",'&#39;');

document.addEventListener('DOMContentLoaded', async ()=>{
  // Solo admin
  const user = getAuthData();
  if (!user || Number(user.rol) !== 1) {
    location.href = '/index.html';
    return;
  }

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  const loading = $('loadingIndicator');
  const errorBox= $('errorContainer');
  const details = $('adopcionDetails');
  const retry   = errorBox?.querySelector('.retry-btn');

  retry?.addEventListener('click', ()=> { errorBox.classList.add('d-none'); load(); });

  async function load(){
    loading.classList.remove('d-none');
    details.classList.add('d-none');
    try{
      const raw = await makeRequest(`/api/adopciones/${encodeURIComponent(id)}`, 'GET');
      const a = normalizeRow(raw || {});
      $('id').textContent      = a.id ?? '-';
      $('fecha').textContent   = a.fecha ? new Date(a.fecha).toLocaleDateString() : '-';
      $('mascota').textContent = a.mascota ?? '-';
      $('usuario').textContent = a.usuario ?? '-';

      const edit = $('editLink');
      if (edit) edit.href = `/pages/adopciones/editar-adopcion.html?id=${encodeURIComponent(a.id)}`;

      $('btnRevertir').onclick = async ()=>{
        if (!confirm('¿Revertir esta adopción? La mascota volverá a "Disponible".')) return;
        try{
          await makeRequest(`/api/adopciones/${a.id}`, 'DELETE');
          alert('Adopción revertida.');
          location.href = '/pages/adopciones/adopciones-admin.html';
        }catch(e){
          alert(e?.message || 'No fue posible revertir la adopción');
        }
      };

      details.classList.remove('d-none');
    }catch(e){
      errorBox.classList.remove('d-none');
      errorBox.querySelector('.error-message').textContent = e?.message || 'No fue posible cargar la adopción.';
    }finally{
      loading.classList.add('d-none');
    }
  }

  if (!id) {
    errorBox.classList.remove('d-none');
    errorBox.querySelector('.error-message').textContent = 'ID de adopción no proporcionado';
  } else {
    load();
  }
});
