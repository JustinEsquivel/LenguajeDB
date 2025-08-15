import { makeRequest, showAlert, normalizeList, normalizeRow } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  loadMascotasDisponibles();

  const form = document.getElementById('searchForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchTerm = document.getElementById('searchInput').value.trim();
      loadMascotasDisponibles(searchTerm);
    });
  }
});

async function loadMascotasDisponibles(searchTerm = '') {
  try {
    showLoading(true);
    let url = '/mascotas-disponibles';
    if (searchTerm) url += `?NOMBRE=${encodeURIComponent(searchTerm)}`;

    const data = await makeRequest(url, 'GET');
    const mascotas = normalizeList(data);

    if (!mascotas || mascotas.length === 0) showNoResults();
    else renderMascotasDisponibles(mascotas);
  } catch (e) {
    console.error(e);
    showError('Error al cargar las mascotas. Intenta nuevamente.');
  } finally {
    showLoading(false);
  }
}

function renderMascotasDisponibles(mascotas) {
  const container = document.getElementById('mascotasContainer');
  const noResults = document.getElementById('noResults');
  container.innerHTML = '';
  noResults.classList.add('d-none');

  mascotas.forEach(m => {
    const id = m.id ?? m['id'];
    const nombre = m.nombre ?? m['nombre'];
    const raza = m.raza ?? m['raza'];
    const estado = m.estado ?? m['estado'];
    const descripcion = m.descripcion ?? m['descripcion'];
    const foto = m.foto ?? m['foto'];
    const edad = Number(m.edad ?? m['edad']);

    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';

    let edadDisplay = '';
    if (edad < 1) {
      const meses = Math.floor(edad * 12);
      edadDisplay = `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      edadDisplay = `${edad} ${edad === 1 ? 'año' : 'años'}`;
    }

    col.innerHTML = `
      <div class="card h-100 shadow-sm pet-card">
        ${foto ? `<img src="${foto}" class="card-img-top pet-img" alt="${nombre}">`
               : `<div class="card-img-top bg-light d-flex align-items-center justify-content-center pet-img">
                    <i class="fas fa-paw fa-4x text-muted"></i>
                  </div>`}
        <div class="card-body">
          <h5 class="card-title">${nombre}</h5>
          <p class="card-text">
            <span class="badge bg-success">${estado}</span><br>
            <strong>Raza:</strong> ${raza}<br>
            <strong>Edad:</strong> ${edadDisplay}<br>
            <strong>Descripción:</strong> ${descripcion ? (descripcion.substring(0,50)+'...') : 'Sin descripción'}
          </p>
        </div>
        <div class="card-footer bg-white">
          <a href="detalle-mascota.html?id=${id}" class="btn btn-primary btn-sm">
            <i class="fas fa-info-circle"></i> Ver detalles
          </a>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

function showLoading(show) {
  const loader = document.getElementById('loadingIndicator');
  if (loader) loader.style.display = show ? 'block' : 'none';
}

function showError(message) {
  const container = document.getElementById('mascotasContainer');
  container.innerHTML = `
    <div class="col-12">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
        <button class="btn btn-sm btn-outline-danger ms-2 retry-btn">
          <i class="fas fa-sync-alt me-1"></i> Reintentar
        </button>
      </div>
    </div>`;
  document.querySelector('.retry-btn').addEventListener('click', () => loadMascotasDisponibles());
}

function showNoResults() {
  document.getElementById('noResults').classList.remove('d-none');
}
