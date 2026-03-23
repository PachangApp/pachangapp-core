SET FOREIGN_KEY_CHECKS = 0;


-- Limpiamos datos antiguos para evitar nombres duplicados o confusos
DELETE FROM campos;
DELETE FROM reservas;
DELETE FROM partidos;
DELETE FROM partido_jugadores;


-- 1. Insertamos los campos de Fútbol 11 (Padres)
INSERT INTO campos (id, nombre, zona, deporte, precio_por_hora, disponible, imagen_url, parent_campo_id) VALUES 
(1, 'Centro de Actividades Deportiva UGR - Campus Cartuja', 'Granada Centro', 'Fútbol 11', 45.0, 1, '', NULL),
(2, 'Campo de fútbol Fuentenueva', 'Granada Centro', 'Fútbol 11', 45.0, 1, '', NULL);

-- 2. Insertamos las pistas de Fútbol 7 (Hijos) vinculadas a sus padres
INSERT INTO campos (nombre, zona, deporte, precio_por_hora, disponible, imagen_url, parent_campo_id) VALUES 
('Pista 1 - Campus Cartuja', 'Granada Centro', 'Fútbol 7', 25.0, 1, '', 1),
('Pista 2 - Campus Cartuja', 'Granada Centro', 'Fútbol 7', 25.0, 1, '', 1),
('Pista 1 - Fuentenueva', 'Granada Centro', 'Fútbol 7', 25.0, 1, '', 2),
('Pista 2 - Fuentenueva', 'Granada Centro', 'Fútbol 7', 25.0, 1, '', 2),
('Fuentenueva - futbol sala pista 1', 'Granada Centro', 'Fútbol Sala', 20.0, 1, '', NULL),
('Fuentenueva - futbol sala pista 2', 'Granada Centro', 'Fútbol Sala', 20.0, 1, '', NULL),
('Fuentenueva - futbol sala pista 3', 'Granada Centro', 'Fútbol Sala', 20.0, 1, '', NULL);



SET FOREIGN_KEY_CHECKS = 1;

