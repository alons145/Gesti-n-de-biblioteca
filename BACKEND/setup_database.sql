-- Script para crear la base de datos y datos de ejemplo

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS biblioteca_db;
USE biblioteca_db;

-- La tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- La tabla de libros
CREATE TABLE IF NOT EXISTS libros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500),
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- La tabla de préstamos
CREATE TABLE IF NOT EXISTS prestamos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    libro_id INT NOT NULL,
    fecha_prestamo DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_esperada DATE,
    fecha_devolucion_real DATE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (libro_id) REFERENCES libros(id)
);

-- Datos de ejemplo para clientes
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Juan Pérez', 'juan.perez@example.com', '1234567890', 'Calle Principal 123'),
('María García', 'maria.garcia@example.com', '0987654321', 'Avenida Central 456'),
('Carlos López', 'carlos.lopez@example.com', '1122334455', 'Calle Secundaria 789'),
('Ana Martínez', 'ana.martinez@example.com', '5544332211', 'Paseo Arbolado 101');

-- Datos de ejemplo para libros
INSERT INTO libros (titulo, autor, categoria, descripcion, disponible) VALUES
('El Quijote', 'Miguel de Cervantes', 'Clásicos', 'Novela clásica española que cuenta las aventuras de Don Quijote', TRUE),
('Cien años de soledad', 'Gabriel García Márquez', 'Realismo Mágico', 'Novela que narra la historia de la familia Buendía en Macondo', TRUE),
('1984', 'George Orwell', 'Distopía', 'Novela distópica sobre un régimen totalitario', TRUE),
('El gran Gatsby', 'F. Scott Fitzgerald', 'Romance', 'Novela sobre la vida en los años veinte en Nueva York', TRUE),
('To Kill a Mockingbird', 'Harper Lee', 'Drama', 'Historia de injusticia racial en Alabama', TRUE),
('El Hobbit', 'J.R.R. Tolkien', 'Fantasía', 'Las aventuras de Bilbo Bolsón en la Tierra Media', TRUE),
('Orgullo y Prejuicio', 'Jane Austen', 'Romance', 'Historia de amor y matrimonio en la Inglaterra regencial', TRUE),
('Crimen y Castigo', 'Fiódor Dostoyevski', 'Psicológica', 'Novela sobre crimen, culpa y redención', TRUE);
