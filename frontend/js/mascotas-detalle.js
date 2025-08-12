import { makeRequest, checkAuth, showAlert } from './utils.js'; 

  

document.addEventListener('DOMContentLoaded', async () => { 

  checkAuth(); 

  await loadMascotaDetails(); 

}); 

  

async function loadMascotaDetails() { 

  try { 

    const urlParams = new URLSearchParams(window.location.search); 

    const mascotaId = urlParams.get('id'); 

     

    if (!mascotaId) { 

      throw new Error('ID de mascota no proporcionado'); 

    } 

  

    const mascota = await makeRequest(`/mascotas/${mascotaId}`); 

     

    if (!mascota) { 

      throw new Error('Mascota no encontrada'); 

    } 

  

    renderMascotaDetails(mascota); 

  } catch (error) { 

    console.error('Error al cargar detalles:', error); 

    showError(error.message); 

  } 

} 

  

function renderMascotaDetails(mascota) { 

  // Ocultar indicador de carga 

  document.getElementById('loadingIndicator').classList.add('d-none'); 

   

  // Mostrar detalles 

  const detailsSection = document.getElementById('mascotaDetails'); 

  detailsSection.classList.remove('d-none'); 

  

  // Llenar datos 

  document.getElementById('nombre').textContent = mascota.nombre; 

  document.getElementById('raza').textContent = mascota.raza; 

  document.getElementById('edad').textContent = mascota.edad; 

  document.getElementById('estado').textContent = mascota.estado; 

  document.getElementById('descripcion').textContent = mascota.descripcion || 'No disponible'; 

  

  // Manejar foto 

  const fotoContainer = document.getElementById('fotoContainer'); 

  if (mascota.foto) { 

    fotoContainer.innerHTML = ` 

      <img src="${mascota.foto}" alt="Foto de ${mascota.nombre}" class="img-fluid rounded" style="max-height: 300px;"> 

    `; 

  } else { 

    fotoContainer.innerHTML = ` 

      <div class="text-center py-4 bg-light rounded"> 

        <i class="fas fa-paw fa-4x text-muted mb-3"></i> 

        <p class="text-muted">No hay foto disponible</p> 

      </div> 

    `; 

  } 

  

  // Configurar enlace de edición 

  const editLink = document.getElementById('editLink'); 

  if (editLink) { 

    editLink.href = `editar-mascota.html?id=${mascota.id}`; 

  } 

} 

  

function showError(message) { 

  document.getElementById('loadingIndicator').classList.add('d-none'); 

   

  const errorContainer = document.getElementById('errorContainer'); 

  errorContainer.classList.remove('d-none'); 

   

  // Mostrar mensaje de error específico 

  const errorMessage = errorContainer.querySelector('.error-message'); 

  if (errorMessage) { 

    errorMessage.textContent = message || 'Error al cargar la mascota'; 

  } 

   

  // Configurar botón de reintento 

  const retryBtn = errorContainer.querySelector('.retry-btn'); 

  if (retryBtn) { 

    retryBtn.addEventListener('click', () => { 

      errorContainer.classList.add('d-none'); 

      document.getElementById('loadingIndicator').classList.remove('d-none'); 

      loadMascotaDetails(); 

    }); 

  } 

} 