document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadMascotaData();
    setupFormValidation();
});

async function loadMascotaData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const mascotaId = urlParams.get('id');
        
        if (!mascotaId) {
            throw new Error('ID de mascota no proporcionado');
        }
        
        const mascota = await makeRequest(`/mascotas/${mascotaId}`);
        populateForm(mascota);
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showError();
    }
}

function populateForm(mascota) {
    document.getElementById('loadingIndicator').classList.add('d-none');
    document.getElementById('editMascotaForm').classList.remove('d-none');
    
    document.getElementById('mascotaId').value = mascota.id;
    document.getElementById('nombre').value = mascota.nombre;
    document.getElementById('raza').value = mascota.raza;
    document.getElementById('edad').value = mascota.edad;
    document.getElementById('descripcion').value = mascota.descripcion || '';
    document.getElementById('estado').value = mascota.estado;
    
    const fotoContainer = document.getElementById('currentFoto');
    if (mascota.foto) {
        fotoContainer.innerHTML = `
            <img src="${mascota.foto}" alt="Foto actual" class="img-thumbnail" style="max-width: 200px;">
        `;
    } else {
        fotoContainer.innerHTML = '<p class="text-muted">No hay foto actual</p>';
    }
}

function setupFormValidation() {
    const form = document.getElementById('editMascotaForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            
            const mascotaId = document.getElementById('mascotaId').value;
            const formData = prepareFormData();
            
            const response = await fetch(`http://localhost:5000/api/mascotas/${mascotaId}`, {
                method: 'PUT',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar la mascota');
            }
            
            window.location.href = `detalle-mascota.html?id=${mascotaId}&success=Mascota actualizada correctamente`;
        } catch (error) {
            console.error('Error al guardar:', error);
            document.getElementById('errorSummary').textContent = error.message;
            document.getElementById('errorSummary').classList.remove('d-none');
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        }
    });
}

function validateForm() {
    let isValid = true;
    
    // Validar campos requeridos
    const requiredFields = ['nombre', 'raza', 'edad', 'estado'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validar que edad sea número positivo
    const edadField = document.getElementById('edad');
    if (isNaN(edadField.value) || parseInt(edadField.value) < 0) {
        edadField.classList.add('is-invalid');
        isValid = false;
    }
    
    return isValid;
}

function prepareFormData() {
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('raza', document.getElementById('raza').value);
    formData.append('edad', document.getElementById('edad').value);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('estado', document.getElementById('estado').value);
    
    const fotoInput = document.getElementById('foto');
    if (fotoInput.files.length > 0) {
        formData.append('foto', fotoInput.files[0]);
    }
    
    return formData;
}

function showError() {
    document.getElementById('loadingIndicator').classList.add('d-none');
    document.getElementById('errorContainer').classList.remove('d-none');
}