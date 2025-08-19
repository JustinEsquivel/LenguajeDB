import { getAuthData, clearAuthData } from '../utils.js';

export function mountHeader() {
  const container = document.getElementById('siteHeader');
  if (!container) return;

  const user = getAuthData();
  const rol = Number(user?.rol ?? 0);

  // Menús
  const linksAdmin = [
    { href: '/index.html',                                   text: 'Inicio' },
    { href: '/pages/mascotas/mascotas-admin.html',           text: 'Mascotas' },
    { href: '/pages/adopciones/adopciones-admin.html',       text: 'Adopciones' },
    { href: '/pages/eventos/eventos-admin.html',             text: 'Eventos' },
    { href: '/pages/campanas/campanas-admin.html',           text: 'Campañas' },
    { href: '/pages/usuarios/usuarios.html',                 text: 'Usuarios' },
    { href: '/pages/voluntarios/voluntarios-admin.html',     text: 'Voluntarios' },
    { href: '/pages/inventario/inventario-admin.html',       text: 'Inventario' },
    { href: '/pages/reportes/reportes.html',                 text: 'Reportes' }
  ];

  // Público / usuario normal
  const linksPublic = [
    { href: '/index.html',                                   text: 'Inicio' },
    { href: '/pages/mascotas/mascotas-disponibles.html',     text: 'Mascotas' },
    { href: '/pages/eventos/eventos-publicos.html',          text: 'Eventos' },
    { href: '/pages/campanas/campanas-disponibles.html',     text: 'Campañas' },
    { href: '/pages/reportes/reportar.html',                 text: 'Reportar' }
  ];

  // Voluntario: lo mismo que público + extras
  const linksVolunteer = [
    ...linksPublic,
    { href: '/pages/voluntarios/mis-actividades.html',       text: 'Actividades' }
  ];

  const links =
    rol === 1 ? linksAdmin :
    rol === 3 ? linksVolunteer :
    linksPublic;

  const current = location.pathname.replace(/\/+$/, '');

  // Lado derecho del navbar
  let rightHtml = '';
  if (user) {
    rightHtml = `
      ${rol === 1 ? `
        <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
          <a class="btn btn-outline-primary btn-sm" href="/dashboard.html">Dashboard</a>
        </li>` : ''
      }
      <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
        <span class="navbar-text small text-muted">Hola, ${esc(user.nombre || 'Usuario')}</span>
      </li>
      <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
        <a class="btn btn-danger btn-sm text-white" href="#" id="logoutBtn">Cerrar sesión</a>
      </li>`;
  } else {
    rightHtml = `
      <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
        <a class="btn btn-primary btn-sm text-white" href="/register.html">Registro</a>
      </li>
      <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
        <a class="btn btn-success btn-sm text-white" href="/login.html">Login</a>
      </li>`;
  }

  container.innerHTML = `
    <header class="bg-white shadow-sm">
      <nav class="navbar navbar-expand-lg navbar-light container">
        <a class="navbar-brand sitename" href="/index.html">Dejando Huella</a>

        <!-- Toggler compatible B4/B5 -->
        <button class="navbar-toggler" type="button"
                data-toggle="collapse" data-target="#mainNav"
                data-bs-toggle="collapse" data-bs-target="#mainNav"
                aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainNav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto ml-auto align-items-lg-center" id="navLinks">
            ${links.map(l => `
              <li class="nav-item">
                <a class="nav-link ${current === l.href ? 'active' : ''}" href="${l.href}">${l.text}</a>
              </li>`).join('')}
            ${rightHtml}
          </ul>
        </div>
      </nav>
    </header>
  `;

  container.querySelector('#logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuthData();
    if (location.pathname.startsWith('/dashboard') || location.pathname.includes('/pages/')) {
      location.href = '/index.html';
    } else {
      location.reload();
    }
  });
}

function esc(s = '') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

document.addEventListener('DOMContentLoaded', mountHeader);
