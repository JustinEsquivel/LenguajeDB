import { makeRequest, showAlert } from './utils.js'; 

document.addEventListener('DOMContentLoaded', () => { 

  loadMascotasDisponibles(); 

   

  document.getElementById('searchForm').addEventListener('submit', (e) => { 

    e.preventDefault(); 

    const searchTerm = document.getElementById('searchInput').value.trim(); 

    loadMascotasDisponibles(searchTerm); 

  }); 

}); 

  

async function loadMascotasDisponibles(searchTerm = '') { 

  try { 

    showLoading(true); 

     

    let url = '/mascotas-disponibles'; 

    if (searchTerm) { 

      url = `/mascotas-disponibles?NOMBRE=${encodeURIComponent(searchTerm)}`; 

    } 

     

    console.log('Cargando mascotas desde:', url); 

     

    const mascotas = await makeRequest(url, 'GET');

    console.log('Mascotas recibidas:', mascotas); 

     

    if (mascotas.length === 0) { 

      showNoResults(); 

    } else { 

      renderMascotasDisponibles(mascotas); 

    } 

  } catch (error) { 

    console.error('Error al cargar mascotas:', error); 

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

   

  mascotas.forEach(mascota => { 

    const col = document.createElement('div'); 

    col.className = 'col-md-4 mb-4'; 

     

    // Formatear la edad para mostrar meses si es menor a 1 año 

    let edadDisplay = ''; 

    if (mascota.edad < 1) { 

      const meses = Math.floor(mascota.edad * 12); 

      edadDisplay = `${meses} ${meses === 1 ? 'mes' : 'meses'}`; 

    } else { 

      edadDisplay = `${mascota.EDAD} ${mascota.EDAD === 1 ? 'año' : 'años'}`; 

    } 

     

    col.innerHTML = ` 

      <div class="card h-100 shadow-sm pet-card"> 

        ${mascota.FOTO ?  

          `<img src="${mascota.FOTO}" class="card-img-top pet-img" alt="${mascota.NOMBRE}">` :  

          `<div class="card-img-top bg-light d-flex align-items-center justify-content-center pet-img"> 

            <i class="fas fa-paw fa-4x text-muted"></i> 

          </div>` 

        } 

        <div class="card-body"> 

          <h5 class="card-title">${mascota.NOMBRE}</h5> 

          <p class="card-text"> 

            <span class="badge bg-success">${mascota.ESTADO}</span> 

            <br> 

            <strong>Raza:</strong> ${mascota.RAZA}<br> 

            <strong>Edad:</strong> ${edadDisplay}<br> 

            <strong>Descripción:</strong> ${mascota.DESCRIPCION ? mascota.DESCRIPCION.substring(0, 50) + '...' : 'Sin descripción'}

          </p> 

        </div> 

        <div class="card-footer bg-white"> 

          <a href="detalle-mascota.html?id=${mascota.ID}" class="btn btn-primary btn-sm"> 

            <i class="fas fa-info-circle"></i> Ver detalles 

          </a> 

          

        </div> 

      </div> 

    `; 

     

    container.appendChild(col); 

  }); 

} 

  

function showLoading(show) { 

  const loader = document.getElementById('loadingIndicator'); 

  if (loader) { 

    loader.style.display = show ? 'block' : 'none'; 

  } 

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

    </div> 

  `; 

   

  document.querySelector('.retry-btn').addEventListener('click', () => { 

    loadMascotasDisponibles(); 

  }); 

} 

  

function showNoResults() { 

  document.getElementById('noResults').classList.remove('d-none'); 

} 