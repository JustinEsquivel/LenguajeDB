// Función para hacer requests a la API
async function makeRequest(url, method = 'GET', data = null, isFormData = false) {
    const options = {
        method,
        headers: {}
    };

    // Solo agregar Content-Type si no es FormData
    if (!isFormData && !(data instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }

    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Preparar body según el tipo de datos
    if (data) {
        if (isFormData || data instanceof FormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }
    }

    try {
        const response = await fetch(`http://localhost:5000/api${url}`, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la solicitud');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para guardar datos en localStorage
function saveAuthData(user, token = null) {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) {
        localStorage.setItem('token', token);
    }
}

// Función para obtener datos de localStorage
function getAuthData() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Función para eliminar datos de autenticación
function clearAuthData() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}

// Función para verificar autenticación
function checkAuth() {
    const user = getAuthData();
    const currentPage = window.location.pathname.split('/').pop();
    const authPages = ['login.html', 'register.html'];
    const protectedPages = ['dashboard.html', 'Mascotas-Create.html', 'MascotasDisponibles.html'];
    
    // Redirigir si:
    // - Usuario no logueado intenta acceder a páginas protegidas
    // - Usuario logueado intenta acceder a páginas de autenticación
    if (!user && protectedPages.includes(currentPage)) {
        window.location.href = 'login.html';
    } else if (user && authPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
    }
}
function showAlert(message, type = 'success') {
    // Puedes personalizar esto con HTML y estilos Bootstrap si quieres
    alert(`${type.toUpperCase()}: ${message}`);
}

// Exportar funciones para usar en otros archivos si es necesario
export {
    makeRequest,
    saveAuthData,
    getAuthData,
    clearAuthData,
    checkAuth,
    showAlert // Asegúrate de que esté definida si la usas
};
