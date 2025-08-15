import { makeRequest, normalizeRow, getAuthData } from '/js/utils.js';

const qs = new URLSearchParams(location.search);
const ID = Number(qs.get('id'));

function esc(s=''){
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
                  .replaceAll('>','&gt;').replaceAll('"','&quot;')
                  .replaceAll("'",'&#39;');
}
function fmtDate(v){
  const s = String(v||''); const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1]; const d = new Date(s); return isNaN(d)? s.slice(0,10) :
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const u = getAuthData();
  if (!u || Number(u.rol)!==1) { location.href='/index.html'; return; }
  if (!ID){ alert('Falta ?id'); location.href='/pages/reportes/reportes.html'; return; }

  try{
    const raw = await makeRequest(`/reportes/${ID}`, 'GET');
    const r = normalizeRow(raw||{});

    document.getElementById('repId').textContent      = `#${r.id ?? ID}`;
    document.getElementById('repFecha').textContent   = fmtDate(r.fecha);
    document.getElementById('repUbig').textContent    = `${r.provincia||'-'} / ${r.canton||'-'} / ${r.distrito||'-'}`;
    document.getElementById('repUsuario').textContent = String(r.usuario ?? '-');
    document.getElementById('repMascota').textContent = String(r.mascota ?? '-');
    document.getElementById('repDetalles').textContent= r.detalles || '-';

    const edit = document.getElementById('editLink');
    if (edit) edit.href = `/pages/reportes/editar-reporte.html?id=${r.id}`;
  }catch(e){
    alert(e.message || 'No se pudo cargar el reporte');
    location.href='/pages/reportes/reportes.html';
  }

  document.getElementById('btnDelete')?.addEventListener('click', async ()=>{
    if (!confirm(`¿Eliminar reporte #${ID}?`)) return;
    try{
      await makeRequest(`/reportes/${ID}`, 'DELETE');
      location.href = '/pages/reportes/reportes.html';
    }catch(e){
      alert(e.message || 'No fue posible eliminar.');
    }
  });
});
