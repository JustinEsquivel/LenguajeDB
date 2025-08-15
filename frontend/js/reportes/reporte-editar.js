import { makeRequest, normalizeRow, getAuthData } from '/js/utils.js';

const qs = new URLSearchParams(location.search);
const ID = Number(qs.get('id'));

function toIso(d=new Date()){
  const p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function fmtIn(v){
  if (!v) return '';
  const s=String(v); const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1]; const d=new Date(s); return isNaN(d)? '' : toIso(d);
}
function show(elId,msg){ const el=document.getElementById(elId); if(!el)return; el.textContent=msg; el.classList.remove('d-none'); }
function hide(elId){ document.getElementById(elId)?.classList.add('d-none'); }

document.addEventListener('DOMContentLoaded', async ()=>{
  const u = getAuthData();
  if (!u || Number(u.rol)!==1) { location.href='/index.html'; return; }
  if (!ID){ alert('Falta ?id'); location.href='/pages/reportes/reportes.html'; return; }

  // Cargar datos
  try{
    const raw = await makeRequest(`/reportes/${ID}`, 'GET');
    const r = normalizeRow(raw||{});
    document.getElementById('fecha').value     = fmtIn(r.fecha) || toIso(new Date());
    document.getElementById('usuario').value   = r.usuario ?? '';
    document.getElementById('mascota').value   = r.mascota ?? '';
    document.getElementById('provincia').value = r.provincia || '';
    document.getElementById('canton').value    = r.canton || '';
    document.getElementById('distrito').value  = r.distrito || '';
    document.getElementById('detalles').value  = r.detalles || '';

    const cancel = document.getElementById('cancelLink');
    if (cancel) cancel.href = `/pages/reportes/detalle-reporte.html?id=${ID}`;
  }catch(e){
    alert(e.message || 'No se pudo cargar el reporte');
    location.href='/pages/reportes/reportes.html';
  }

  // Guardar
  document.getElementById('repForm').addEventListener('submit', async (e)=>{
    e.preventDefault(); hide('msgOk'); hide('msgErr');

    const fecha   = (document.getElementById('fecha').value || '').trim();
    const usuario = (document.getElementById('usuario').value || '').trim();
    const mascota = (document.getElementById('mascota').value || '').trim();
    const provincia = (document.getElementById('provincia').value || '').trim();
    const canton    = (document.getElementById('canton').value || '').trim();
    const distrito  = (document.getElementById('distrito').value || '').trim();
    const detalles  = (document.getElementById('detalles').value || '').trim();

    if (!fecha || !provincia || !canton || !distrito || !detalles) {
      show('msgErr','Completa los campos requeridos.'); return;
    }

    const payload = {
      fecha,
      usuario: usuario ? Number(usuario) : null,
      mascota: mascota ? Number(mascota) : null,
      provincia, canton, distrito, detalles
    };

    const btn = e.submitter;
    try{
      if (btn){ btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
      await makeRequest(`/reportes/${ID}`, 'PUT', payload);
      show('msgOk','Cambios guardados.');
      setTimeout(()=> location.href=`/pages/reportes/detalle-reporte.html?id=${ID}`, 600);
    }catch(err){
      show('msgErr', err.message || 'No fue posible actualizar.');
    }finally{
      if (btn){ btn.disabled=false; btn.innerHTML='<i class="fas fa-save me-1"></i> Guardar'; }
    }
  });
});
