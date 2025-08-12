// Función para validar el formulario de mascota
function validateMascotaForm() {
    let isValid = true;
    const errors = [];
    
    // Limpiar errores anteriores
    $('.text-danger').addClass('d-none');
    $('#errorSummary').addClass('d-none').empty();
    
    // Validar campos
    if (!$('#nombre').val()) {
        $('#nombreError').text('El nombre es requerido').removeClass('d-none');
        errors.push('El nombre es requerido');
        isValid = false;
    }
    
    if (!$('#raza').val()) {
        $('#razaError').text('La raza es requerida').removeClass('d-none');
        errors.push('La raza es requerida');
        isValid = false;
    }
    
    if (!$('#edad').val() || $('#edad').val() < 0) {
        $('#edadError').text('La edad es requerida y debe ser positiva').removeClass('d-none');
        errors.push('La edad es requerida y debe ser positiva');
        isValid = false;
    }
    
    if (!$('#descripcion').val()) {
        $('#descripcionError').text('La descripción es requerida').removeClass('d-none');
        errors.push('La descripción es requerida');
        isValid = false;
    }
    
    if (!isValid) {
        $('#errorSummary').html('<ul>' + errors.map(error => `<li>${error}</li>`).join('') + '</ul>').removeClass('d-none');
    }
    
    return isValid;
}

// Función para preparar los datos del formulario
function prepareMascotaData() {
    const formData = new FormData();
    formData.append('nombre', $('#nombre').val());
    formData.append('raza', $('#raza').val());
    formData.append('edad', $('#edad').val());
    formData.append('descripcion', $('#descripcion').val());
    formData.append('estado', $('#estado').val());
    
    // Obtener usuario actual del localStorage
    const user = getAuthData();
    if (user) {
        formData.append('usuario', user.id);
    }
    
    // Agregar archivo si existe
    const fotoInput = $('#foto')[0];
    if (fotoInput.files.length > 0) {
        formData.append('foto', fotoInput.files[0]);
    }
    
    return formData;
}

// Función para manejar el envío del formulario
async function handleMascotaSubmit(e) {
    e.preventDefault();
    
    if (!validateMascotaForm()) return;
    
    const formData = prepareMascotaData();
    const submitBtn = $('#mascotaForm button[type="submit"]');
    
    try {
        // Cambiar estado del botón
        submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i> Procesando...');
        
        const response = await fetch('http://localhost:5000/api/mascotas', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Si usas JWT
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear la mascota');
        }
        
        const data = await response.json();
        alert('Mascota creada exitosamente!');
        window.location.href = 'MascotasDisponibles.html';
    } catch (error) {
        console.error('Error:', error);
        $('#errorSummary').text(error.message).removeClass('d-none');
    } finally {
        // Restaurar estado del botón
        submitBtn.prop('disabled', false).html('<i class="fas fa-plus-circle me-1"></i> Crear');
    }
}

// Evento cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    checkAuth();
    
    // Asignar evento al formulario
    $('#mascotaForm').on('submit', handleMascotaSubmit);
    
    // Mostrar información del usuario si está logueado
    const user = getAuthData();
    if (user && document.getElementById('welcomeName')) {
        document.getElementById('welcomeName').textContent = user.nombre;
    }
});