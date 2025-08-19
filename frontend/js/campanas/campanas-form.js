import { makeRequest, normalizeRow, getAuthData } from '../utils.js';


const pick = (...ids) => ids.map(id => document.getElementById(id)).find(Boolean);
const getV  = el => (el?.value ?? '').trim();

const toInputDate = (v) => {
  if (!v) return '';
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0,10);

  const s = String(v);

  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yy] = s.split('/').map(n => parseInt(n,10));
    const d = new Date(yy, mm-1, dd);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0,10);
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0,10);
};

function ymd(v){
  if (!v) return null;
  const s = String(v).trim();

  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yy] = s.split('/').map(n => parseInt(n,10));
    const d = new Date(yy, mm-1, dd);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0,10);
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0,10);
}

function num(v){
  const n = Number(String(v ?? '').replace(',','.'));
  return Number.isFinite(n) ? n : NaN;
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const ID = params.get('id');

  const form     = document.getElementById('campanaForm');
  const loader   = document.getElementById('loadingIndicator');
  const errorBox = document.getElementById('errorSummary');

  // Mapeo flexible de IDs para tolerar variaciones de HTML
  const el = {
    id:       pick('campanaId','id'),
    nombre:   pick('nombre'),
    desc:     pick('descripcion','descripcionCampana'),
    inicio:   pick('fechaInicio','inicio','fechainicio'),
    fin:      pick('fechaFin','fin','fechafin'),
    objetivo: pick('objetivo','meta'),
    estado:   pick('estado'),
    usuario:  pick('usuario','responsable')
  };

  const required = ['nombre','desc','inicio','fin','objetivo','estado'];
  const missing = required.filter(k => !el[k]);
  if (missing.length) {
    if (errorBox) {
      errorBox.classList.remove('d-none');
      errorBox.textContent = `Faltan campos en el HTML con IDs: ${missing.join(', ')}. Verifica los IDs del formulario.`;
    }
    console.warn('Faltan elementos en el formulario:', missing);
    return;
  }

  if (ID) {
    try {
      loader?.classList.remove('d-none');
      const row = normalizeRow(await makeRequest(`/campanas/${encodeURIComponent(ID)}`, 'GET'));

      if (el.id)        el.id.value    = row.id ?? ID;
      el.nombre.value   = row.nombre || '';
      el.desc.value     = row.descripcion || '';
      el.inicio.value   = toInputDate(row.fechainicio || row.inicio);
      el.fin.value      = toInputDate(row.fechafin   || row.fin);
      el.objetivo.value = row.objetivo ?? '';
      el.estado.value   = row.estado   || 'Activa';
      if (el.usuario)   el.usuario.value = row.usuario ?? '';
    } catch (e) {
      if (errorBox) {
        errorBox.classList.remove('d-none');
        errorBox.textContent = e?.message || 'Error al cargar la campaña';
      }
    } finally {
      loader?.classList.add('d-none');
      form?.classList.remove('d-none');
    }
  } else {
    loader?.classList.add('d-none');
    form?.classList.remove('d-none');
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox?.classList.add('d-none');

    const nombre = getV(el.nombre);
    const desc   = getV(el.desc);
    const iniYMD = ymd(getV(el.inicio));
    const finYMD = ymd(getV(el.fin));
    const obj    = num(getV(el.objetivo));
    const estado = getV(el.estado) || 'Activa';

    // Usuario: si no hay campo visible, tomamos del auth
    const uAuth  = getAuthData();
    const usuario = el.usuario
      ? (num(getV(el.usuario)) || (uAuth?.id ?? null))
      : (uAuth?.id ?? null);

    const errs = [];
    if (!nombre) errs.push('Nombre es obligatorio');
    if (!desc) errs.push('Descripción es obligatoria');
    if (!iniYMD) errs.push('Fecha de inicio inválida');
    if (!finYMD) errs.push('Fecha de fin inválida');
    if (!Number.isFinite(obj)) errs.push('Objetivo debe ser numérico');

    if (errs.length) {
      errorBox?.classList.remove('d-none');
      errorBox.innerHTML = '<ul>' + errs.map(x => `<li>${x}</li>`).join('') + '</ul>';
      return;
    }

    const payload = {
      nombre,
      descripcion: desc,
      fechainicio: iniYMD,   
      fechafin:    finYMD,   
      fechaInicio: iniYMD,   
      fechaFin:    finYMD,   
      objetivo: obj,
      estado,
      usuario
    };

    const btn = e.submitter;
    try {
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...'; }

      if (ID) {
        // UPDATE
        await makeRequest(`/campanas/${encodeURIComponent(ID)}`, 'PUT', payload);
        location.href = `/pages/campanas/detalle-campana.html?id=${encodeURIComponent(ID)}&ok=1`;
      } else {
        // CREATE
        const created = await makeRequest('/campanas', 'POST', payload);
        const newId = created?.id ?? created?.ID ?? created?.Id ?? '';
        location.href = `/pages/campanas/detalle-campana.html?id=${encodeURIComponent(newId)}`;
      }
    } catch (err) {
      errorBox?.classList.remove('d-none');
      errorBox.textContent = err?.message || 'Error al guardar la campaña';
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = ID ? '<i class="fas fa-save me-1"></i> Guardar cambios' : '<i class="fas fa-plus-circle me-1"></i> Crear'; }
    }
  });
});
