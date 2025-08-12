-- Insertar datos en las tablas
INSERT INTO Roles (id, nombre) VALUES (1, 'Administrador');
INSERT INTO Roles (id, nombre) VALUES (2, 'Usuario');
INSERT INTO Roles (id, nombre) VALUES (3, 'Voluntario');

INSERT INTO Usuarios (id, nombre, apellido, email, password, telefono, rol) 
VALUES (1, 'Justin', 'Esquivel', 'jesquivel@email.com', 'jus123', '22222222', 1);

INSERT INTO Usuarios (id, nombre, apellido, email, password, telefono, rol) 
VALUES (2, 'Juan', 'Gomez', 'jgomez@email.com', 'juan123', '55555555', 2);

INSERT INTO Usuarios (id, nombre, apellido, email, password, telefono, rol) 
VALUES (3, 'Oscar', 'Lopez', 'olopez@email.com', 'oscar123', '11111111', 3);

-- Insertar mascotas
INSERT INTO Mascotas (id, nombre, raza, edad, descripcion, foto, estado, usuario) 
VALUES (1, 'Firulais', 'Pastor Aleman', 5, 'Perro muy jugueton', 
'https://th.bing.com/th/id/R.eb2b1e17c4e858d53155cc2c8aa44c41?rik=wo7SpEIlCdZAcg&riu=http%3a%2f%2fmicompi.com%2fblog%2fwp-content%2fuploads%2f2015%2f02%2fpastor-aleman-02.jpg&ehk=hVI6oY9q93DGK7d4IV0H9WgJpNR%2bJA0V%2bOYog6qvjQw%3d&risl=&pid=ImgRaw&r=0', 
'Disponible', 1);

INSERT INTO Mascotas (id, nombre, raza, edad, descripcion, foto, estado, usuario) 
VALUES (2, 'Michi', 'Siames', 3, 'Gato muy cariñoso', 
'https://th.bing.com/th/id/R.05c7a6031cec41379e72b095d582d262?rik=ttZ9dEibbwSFig&pid=ImgRaw&r=0', 
'Disponible', 1);

INSERT INTO Mascotas (id, nombre, raza, edad, descripcion, foto, estado, usuario) 
VALUES (3, 'Pirata', 'Labrador', 4, 'Perro muy amigable', 
'https://th.bing.com/th/id/OIP.BDKUqeAtNT9nEq7J1cPDDwHaFj?rs=1&pid=ImgDetMain', 
'Adoptado', 2);

INSERT INTO Mascotas (id, nombre, raza, edad, descripcion, foto, estado, usuario) 
VALUES (4, 'Chispas', 'Perico Verde', 1, 'Muy juguetón y parlanchín', 
'https://th.bing.com/th/id/OIP.wkAqIudrclE1JE6-ff70hwHaF7?rs=1&pid=ImgDetMain', 
'Disponible', 3);

INSERT INTO Mascotas (id, nombre, raza, edad, descripcion, foto, estado, usuario) 
VALUES (5, 'Luna', 'Ashera', 2, 'Gato muy dormilón', 
'https://www.greenme.com.br/wp-content/uploads/2022/01/ashera.jpg', 
'Adoptado', 2);

INSERT INTO Mascotas (id, nombre, raza, edad, descripcion, foto, estado, usuario) 
VALUES (6, 'Toby', 'Bulldog Inglés', 3, 'Le encanta jugar con agua y es muy cariñoso', 
'https://www.mercafauna.com/fotos/animales/28_bulldog_ingles05.jpg', 
'Adoptado', 2);

-- Insertar historial médico
INSERT INTO HistorialMedico (id, mascota, fecha, diagnostico, tratamiento, veterinario, observaciones, estado) 
VALUES (1, 1, SYSDATE, 'Padece de dificultad al respirar', 'Se le recetaron antibioticos', 'Dr. Juan', 
'Se le debe dar medicamento cada 8 horas', 'Activo');

INSERT INTO HistorialMedico (id, mascota, fecha, diagnostico, tratamiento, veterinario, observaciones, estado) 
VALUES (2, 2, SYSDATE, 'Padece de fiebre', 'Se le recetaron antibioticos', 'Dr. Maria', 
'Se le debe dar medicamento cada 12 horas', 'Activo');

INSERT INTO HistorialMedico (id, mascota, fecha, diagnostico, tratamiento, veterinario, observaciones, estado) 
VALUES (3, 3, SYSDATE, 'Padece de dolor de estomago', 'Se le recetaron antibioticos', 'Dr. Pedro', 
'Se le debe dar medicamento cada 6 horas', 'Activo');

-- Insertar adopciones
INSERT INTO Adopciones (id, fecha, usuario, mascota) VALUES (1, SYSDATE, 2, 3);
INSERT INTO Adopciones (id, fecha, usuario, mascota) VALUES (2, SYSDATE, 2, 5);
INSERT INTO Adopciones (id, fecha, usuario, mascota) VALUES (3, SYSDATE, 3, 6);

-- Insertar reportes
INSERT INTO Reportes (id, fecha, usuario, mascota, provincia, canton, distrito, detalles) 
VALUES (1, SYSDATE, 2, 1, 'Heredia', 'San Pablo', 'Mercedes', 'Se perdio en la calle 5');

INSERT INTO Reportes (id, fecha, usuario, mascota, provincia, canton, distrito, detalles) 
VALUES (2, SYSDATE, 2, 2, 'San José', 'Desamparados', 'San Miguel', 'Se perdio en la calle 10');

INSERT INTO Reportes (id, fecha, usuario, mascota, provincia, canton, distrito, detalles) 
VALUES (3, SYSDATE, 3, 3, 'Heredia', 'Barva', 'San Pedro', 'Se perdio en la calle 15');

INSERT INTO Reportes (id, fecha, usuario, mascota, provincia, canton, distrito, detalles) 
VALUES (4, SYSDATE, 3, NULL, 'Heredia', 'Barva', 'San Pedro', 'Se avistó un gato con su pata trasera lastimada');

-- Insertar campañas
INSERT INTO Campañas (id, nombre, descripcion, fechaInicio, fechaFin, objetivo, estado, usuario) 
VALUES (1, 'Ayuda para los peluditos', 'Campaña para recolectar fondos para los animales del refugio', 
SYSDATE, SYSDATE, 500000, 'Activa', 1);

INSERT INTO Campañas (id, nombre, descripcion, fechaInicio, fechaFin, objetivo, estado, usuario) 
VALUES (2, 'Ayuda para comprar comida', 'Campaña para recolectar fondos para comprar comida para los animales del refugio', 
SYSDATE, SYSDATE, 1000000, 'Activa', 1);

INSERT INTO Campañas (id, nombre, descripcion, fechaInicio, fechaFin, objetivo, estado, usuario) 
VALUES (3, 'Ayuda para pagar servicios', 'Campaña para pagar los servicios del refugio', 
SYSDATE, SYSDATE, 1500000, 'Activa', 1);

-- Insertar donaciones
INSERT INTO DonacionesCampañas (id, fecha, cantidad, usuario, campaña) 
VALUES (1, SYSDATE, 10000, 2, 1);

INSERT INTO DonacionesCampañas (id, fecha, cantidad, usuario, campaña) 
VALUES (2, SYSDATE, 20000, 2, 2);

INSERT INTO DonacionesCampañas (id, fecha, cantidad, usuario, campaña) 
VALUES (3, SYSDATE, 30000, 3, 3);

-- Insertar inventario
INSERT INTO Inventario (id, nombre, tipo, cantidad, fechaIngreso, fechaCaducidad, proveedor, fuente) 
VALUES (1, 'Comida para perro', 'Alimento', 100, SYSDATE, TO_DATE('2025-08-03', 'YYYY-MM-DD'), 'Purina', 'Compra');

INSERT INTO Inventario (id, nombre, tipo, cantidad, fechaIngreso, fechaCaducidad, proveedor, fuente) 
VALUES (2, 'Comida para gato', 'Alimento', 50, SYSDATE, TO_DATE('2025-06-09', 'YYYY-MM-DD'), 'Whiskas', 'Donación');

INSERT INTO Inventario (id, nombre, tipo, cantidad, fechaIngreso, fechaCaducidad, proveedor, fuente) 
VALUES (3, 'Pelotas', 'Juguete', 20, SYSDATE, NULL, 'Juguetes S.A.', 'Donación');

-- Insertar eventos
INSERT INTO Eventos (id, nombre, descripcion, fecha, ubicacion, responsable, tipo, estado) 
VALUES (1, 'Bingo', 'Bingo para recaudar fondos', SYSDATE, 'Salon comunal, Barva, Heredia', 1, 'Presencial', 'En curso');

INSERT INTO Eventos (id, nombre, descripcion, fecha, ubicacion, responsable, tipo, estado) 
VALUES (2, 'Charla de adopción', 'Charla para adoptar mascotas', SYSDATE, 'Microsoft Teams', 1, 'Virtual', 'Planificado');

INSERT INTO Eventos (id, nombre, descripcion, fecha, ubicacion, responsable, tipo, estado) 
VALUES (3, 'Zona de juegos', 'Zona de juegos para mascotas', SYSDATE, 'La Sabana, San José', 1, 'Presencial', 'Finalizado');

-- Insertar asistencias a eventos
INSERT INTO EventosAsistencia (id, evento, usuario) VALUES (1, 1, 2);
INSERT INTO EventosAsistencia (id, evento, usuario) VALUES (2, 1, 3);
INSERT INTO EventosAsistencia (id, evento, usuario) VALUES (3, 2, 2);

-- Insertar voluntarios
INSERT INTO Voluntarios (id, usuario, fechaInicio, fechaFin, horas, estado) 
VALUES (1, 3, SYSDATE, NULL, 10, 'Activo');

INSERT INTO Voluntarios (id, usuario, fechaInicio, fechaFin, horas, estado) 
VALUES (2, 3, SYSDATE, NULL, 5, 'Activo');

INSERT INTO Voluntarios (id, usuario, fechaInicio, fechaFin, horas, estado) 
VALUES (3, 3, SYSDATE, NULL, 8, 'Activo');

-- Insertar actividades de voluntarios
INSERT INTO VoluntariosActividades (voluntario_id, actividad) VALUES (1, 'Limpieza');
INSERT INTO VoluntariosActividades (voluntario_id, actividad) VALUES (1, 'Alimentación');
INSERT INTO VoluntariosActividades (voluntario_id, actividad) VALUES (2, 'Alimentación');
INSERT INTO VoluntariosActividades (voluntario_id, actividad) VALUES (3, 'Limpieza');

-- Insertar contadores
INSERT INTO Contadores (id, seq) VALUES ('roles_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('usuarios_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('mascotas_id', 6);
INSERT INTO Contadores (id, seq) VALUES ('historialMedico_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('adopciones_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('reportes_id', 4);
INSERT INTO Contadores (id, seq) VALUES ('campañas_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('donacionesCampañas_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('inventario_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('eventos_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('eventosAsistencia_id', 3);
INSERT INTO Contadores (id, seq) VALUES ('voluntarios_id', 3);

-- Confirmar los cambios
COMMIT;