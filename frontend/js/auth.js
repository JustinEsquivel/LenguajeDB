import {
  makeRequest,
  saveAuthData,
  getAuthData,
  clearAuthData,
  normalizeRow,
  showError,
  showSuccess
} from './utils.js';

const REGISTER_ENDPOINT = '/api/usuarios'; 
const LOGIN_ENDPOINT    = '/auth/login';   


const registerBtn = document.getElementById('registerButton');
if (registerBtn) {
  registerBtn.addEventListener('click', onRegisterClick);
}

async function onRegisterClick(e) {
  e.preventDefault();
  const errEl = document.getElementById('registerError');
  const okEl  = document.getElementById('registerSuccess');
  if (errEl) errEl.textContent = '';
  if (okEl)  okEl.textContent  = '';

  const nombre   = (document.getElementById('nombre')?.value || '').trim();
  const apellido = (document.getElementById('apellido')?.value || '').trim();
  const email    = (document.getElementById('email')?.value || '').trim();
  const password = (document.getElementById('password')?.value || '');
  const telefono = (document.getElementById('telefono')?.value || '').trim();

  // Validaciones 
  if (!nombre || !apellido || !email || !password) {
    showError('Todos los campos son requeridos', errEl);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('Email no válido', errEl);
    return;
  }
  if (password.length < 6) {
    showError('La contraseña debe tener al menos 6 caracteres', errEl);
    return;
  }
  if (telefono && !/^\d{8,10}$/.test(telefono)) {
    showError('El teléfono debe tener 8 a 10 dígitos', errEl);
    return;
  }

  registerBtn.disabled = true;
  const prevText = registerBtn.textContent;
  registerBtn.textContent = 'Registrando...';

  try {
    await makeRequest(REGISTER_ENDPOINT, 'POST', {
      nombre,
      apellido,
      email,
      password,
      telefono: telefono || null,
      rol: 2 // Usuario
    });

    showSuccess('¡Registro exitoso! Redirigiendo a login...', okEl);
    document.getElementById('registerForm')?.reset();
    setTimeout(() => (window.location.href = 'login.html'), 1500);
  } catch (err) {
    showError(err.message || 'Error en el registro', errEl);
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = prevText;
  }
}


const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', onLoginSubmit);
}

async function onLoginSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById('loginError');
  if (errEl) errEl.textContent = '';

  const email    = (document.getElementById('email')?.value || '').trim();
  const password = (document.getElementById('password')?.value || '');

  if (!email || !password) {
    showError('Ingresa email y contraseña', errEl);
    return;
  }

  try {
    const payload = await makeRequest(LOGIN_ENDPOINT, 'POST', { email, password });

    const norm = normalizeRow(payload);
    const token = norm.token || norm.jwt || null;
    const userObj = norm.user ? normalizeRow(norm.user) : norm;

    const user = {
      id:       userObj.id       ?? userObj.userid     ?? userObj.usuarioid ?? userObj.ID,
      nombre:   userObj.nombre   ?? userObj.NOMBRE,
      apellido: userObj.apellido ?? userObj.APELLIDO,
      email:    userObj.email    ?? userObj.EMAIL,
      rol:      userObj.rol      ?? userObj.ROL
    };

    if (!user.id) throw new Error('Respuesta de login inválida');

    saveAuthData(user, token);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showError(err.message || 'Credenciales inválidas', errEl);
  }
}


document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  clearAuthData();
  window.location.href = 'login.html';
});


document.addEventListener('DOMContentLoaded', () => {
  const user = getAuthData();
  if (!user) return;
  const welcome = document.getElementById('welcomeName');
  const full    = document.getElementById('userName');
  if (welcome) welcome.textContent = user.nombre || '';
  if (full)    full.textContent    = `${user.nombre || ''} ${user.apellido || ''}`.trim();
});
