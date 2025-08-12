const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash'); // Añade esta línea

const app = express();

// Configuración CORS para desarrollo
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Configuración de sesión
app.use(session({
    secret: 'tu_super_secreto_sesion', // Cambia esto en producción
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Flash messages (ahora sí está definido)
app.use(flash());

// Middleware para variables globales
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

// Middlewares para parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sirve archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Rutas API
app.use('/api', require('./routes/usuarioRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/mascotaRoutes'));

// Manejo de errores
app.use((err, req, res, next) => { 
  console.error(err.stack); 
  res.status(500).send('Algo salió mal!'); 
}); 

// Inicia el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});