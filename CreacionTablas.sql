-- Tablas principales
CREATE TABLE Roles (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL CHECK (nombre IN ('Administrador', 'Usuario', 'Voluntario'))
);

CREATE TABLE Usuarios (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL CHECK (REGEXP_LIKE(nombre, '^[A-ZÁÉÍÓÚ][a-záéíóú\s''-]+$')),
    apellido VARCHAR2(100) NOT NULL CHECK (REGEXP_LIKE(apellido, '^[A-ZÁÉÍÓÚ][a-záéíóú\s''-]+$')),
    email VARCHAR2(100) NOT NULL CHECK (REGEXP_LIKE(email, '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')),
    password VARCHAR2(100) NOT NULL CHECK (LENGTH(password) >= 6),
    telefono VARCHAR2(10) NOT NULL CHECK (REGEXP_LIKE(telefono, '^[0-9]{8,10}$')),
    rol NUMBER NOT NULL CHECK (rol IN (1, 2, 3)),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol) REFERENCES Roles(id)
);

CREATE TABLE Mascotas (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    raza VARCHAR2(100) NOT NULL,
    edad NUMBER NOT NULL,
    descripcion VARCHAR2(500) NOT NULL,
    foto VARCHAR2(500),
    estado VARCHAR2(20) NOT NULL CHECK (estado IN ('Disponible', 'Adoptado')),
    usuario NUMBER NOT NULL,
    CONSTRAINT fk_mascota_usuario FOREIGN KEY (usuario) REFERENCES Usuarios(id)
);

CREATE TABLE HistorialMedico (
    id NUMBER PRIMARY KEY,
    mascota NUMBER NOT NULL,
    fecha DATE NOT NULL,
    diagnostico VARCHAR2(500) NOT NULL,
    tratamiento VARCHAR2(500) NOT NULL,
    veterinario VARCHAR2(100) NOT NULL,
    observaciones VARCHAR2(500) NOT NULL,
    estado VARCHAR2(20) NOT NULL CHECK (estado IN ('Activo', 'Inactivo')),
    CONSTRAINT fk_historial_mascota FOREIGN KEY (mascota) REFERENCES Mascotas(id)
);

CREATE TABLE Adopciones (
    id NUMBER PRIMARY KEY,
    fecha DATE NOT NULL,
    usuario NUMBER NOT NULL,
    mascota NUMBER NOT NULL,
    CONSTRAINT fk_adopcion_usuario FOREIGN KEY (usuario) REFERENCES Usuarios(id),
    CONSTRAINT fk_adopcion_mascota FOREIGN KEY (mascota) REFERENCES Mascotas(id),
    CONSTRAINT uk_adopcion_mascota UNIQUE (mascota) -- Una mascota solo puede ser adoptada una vez
);

CREATE TABLE Reportes (
    id NUMBER PRIMARY KEY,
    fecha DATE NOT NULL,
    usuario NUMBER NOT NULL,
    mascota NUMBER,
    provincia VARCHAR2(100) NOT NULL,
    canton VARCHAR2(100) NOT NULL,
    distrito VARCHAR2(100) NOT NULL,
    detalles VARCHAR2(500) NOT NULL,
    CONSTRAINT fk_reporte_usuario FOREIGN KEY (usuario) REFERENCES Usuarios(id),
    CONSTRAINT fk_reporte_mascota FOREIGN KEY (mascota) REFERENCES Mascotas(id)
);

CREATE TABLE Campañas (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    descripcion VARCHAR2(500) NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE NOT NULL,
    objetivo NUMBER NOT NULL,
    estado VARCHAR2(20) NOT NULL CHECK (estado IN ('Activa', 'Inactiva')),
    usuario NUMBER NOT NULL,
    CONSTRAINT fk_campaña_usuario FOREIGN KEY (usuario) REFERENCES Usuarios(id)
);

CREATE TABLE DonacionesCampañas (
    id NUMBER PRIMARY KEY,
    fecha DATE NOT NULL,
    cantidad NUMBER NOT NULL,
    usuario NUMBER NOT NULL,
    campaña NUMBER NOT NULL,
    CONSTRAINT fk_donacion_usuario FOREIGN KEY (usuario) REFERENCES Usuarios(id),
    CONSTRAINT fk_donacion_campaña FOREIGN KEY (campaña) REFERENCES Campañas(id)
);

CREATE TABLE Inventario (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    tipo VARCHAR2(100) NOT NULL,
    cantidad NUMBER NOT NULL,
    fechaIngreso DATE NOT NULL,
    fechaCaducidad DATE,
    proveedor VARCHAR2(100) NOT NULL,
    fuente VARCHAR2(20) NOT NULL CHECK (fuente IN ('Compra', 'Donación'))
);

CREATE TABLE Eventos (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    descripcion VARCHAR2(500) NOT NULL,
    fecha DATE NOT NULL,
    ubicacion VARCHAR2(200) NOT NULL,
    responsable NUMBER NOT NULL,
    tipo VARCHAR2(20) NOT NULL CHECK (tipo IN ('Presencial', 'Virtual')),
    estado VARCHAR2(20) NOT NULL CHECK (estado IN ('En curso', 'Planificado', 'Finalizado')),
    CONSTRAINT fk_evento_responsable FOREIGN KEY (responsable) REFERENCES Usuarios(id)
);

CREATE TABLE EventosAsistencia (
    id NUMBER PRIMARY KEY,
    evento NUMBER NOT NULL,
    usuario NUMBER NOT NULL,
    CONSTRAINT fk_asistencia_evento FOREIGN KEY (evento) REFERENCES Eventos(id),
    CONSTRAINT fk_asistencia_usuario FOREIGN KEY (usuario) REFERENCES Usuarios(id),
    CONSTRAINT uk_asistencia_evento_usuario UNIQUE (evento, usuario) -- Un usuario solo puede asistir una vez a un evento
);

CREATE TABLE Voluntarios (
    id NUMBER PRIMARY KEY,
    usuario NUMBER NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE,
    horas NUMBER NOT NULL,
    estado VARCHAR2(20) NOT NULL CHECK (estado IN ('Activo', 'Inactivo')),
    CONSTRAINT fk_voluntario_usuario FOREIGN KEY (usuario) REFERENCES Usuarios(id)
);

-- Tabla para las actividades de los voluntarios (relación muchos a muchos)
CREATE TABLE VoluntariosActividades (
    voluntario_id NUMBER,
    actividad VARCHAR2(100),
    PRIMARY KEY (voluntario_id, actividad),
    CONSTRAINT fk_va_voluntario FOREIGN KEY (voluntario_id) REFERENCES Voluntarios(id)
);

-- Tabla para contadores (equivalente a la colección Counters en MongoDB)
CREATE TABLE Contadores (
    id VARCHAR2(50) PRIMARY KEY,
    seq NUMBER NOT NULL
);

-- Índices adicionales
CREATE INDEX idx_usuarios_email ON Usuarios(email);
CREATE INDEX idx_mascotas_nombre ON Mascotas(nombre);
CREATE INDEX idx_mascotas_estado ON Mascotas(estado);
CREATE INDEX idx_historial_mascota ON HistorialMedico(mascota);
CREATE INDEX idx_adopciones_usuario ON Adopciones(usuario);
CREATE INDEX idx_reportes_usuario ON Reportes(usuario);
CREATE INDEX idx_campañas_nombre ON Campañas(nombre);
CREATE INDEX idx_campañas_estado ON Campañas(estado);
CREATE INDEX idx_donaciones_usuario ON DonacionesCampañas(usuario);
CREATE INDEX idx_donaciones_campaña ON DonacionesCampañas(campaña);
CREATE INDEX idx_inventario_nombre ON Inventario(nombre);
CREATE INDEX idx_inventario_fuente ON Inventario(fuente);
CREATE INDEX idx_eventos_nombre ON Eventos(nombre);
CREATE INDEX idx_eventos_estado ON Eventos(estado);
CREATE INDEX idx_asistencia_evento ON EventosAsistencia(evento);
CREATE INDEX idx_asistencia_usuario ON EventosAsistencia(usuario);
CREATE INDEX idx_voluntarios_usuario ON Voluntarios(usuario);
CREATE INDEX idx_voluntarios_estado ON Voluntarios(estado);

-- Secuencias para autoincrementales (reemplazo de los contadores de MongoDB)
CREATE SEQUENCE seq_roles START WITH 4;
CREATE SEQUENCE seq_usuarios START WITH 4;
CREATE SEQUENCE seq_mascotas START WITH 7;
CREATE SEQUENCE seq_historial_medico START WITH 4;
CREATE SEQUENCE seq_adopciones START WITH 4;
CREATE SEQUENCE seq_reportes START WITH 5;
CREATE SEQUENCE seq_campañas START WITH 4;
CREATE SEQUENCE seq_donaciones START WITH 4;
CREATE SEQUENCE seq_inventario START WITH 4;
CREATE SEQUENCE seq_eventos START WITH 4;
CREATE SEQUENCE seq_asistencias START WITH 4;
CREATE SEQUENCE seq_voluntarios START WITH 4;