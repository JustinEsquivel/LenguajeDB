const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

const CORS_OPTS = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
};
app.use(cors(CORS_OPTS));
app.options('*', cors(CORS_OPTS));

app.set('trust proxy', 1); 
app.use(session({
  secret: 'super_secreto_sesion', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.use('/api', require('./routes/usuarioRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/mascotaRoutes'));
app.use('/api', require('./routes/eventoRoutes'));
app.use('/api', require('./routes/donacionCampanaRoutes'));
app.use('/api', require('./routes/asistenciaRoutes'));
app.use('/api', require('./routes/inventarioRoutes'));
app.use('/api', require('./routes/adopcionRoutes'));
app.use('/api', require('./routes/reporteRoutes'));
app.use('/api', require('./routes/voluntarioRoutes'));
app.use('/api', require('./routes/voluntarioActividadRoutes'));
app.use('/api', require('./routes/historialRoutes'));
app.use('/api', require('./routes/campanaRoutes'));
app.use('/api/metrics', require('./routes/metricsRoutes'));


app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err);
  const status = err.status || 500;
  const message = err.message || 'Error interno';
  const details = (err.stack || '').split('\n').slice(0, 2).join(' | ');
  res.status(status).json({ error: message, details });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
