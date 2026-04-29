# API Biblioteca - Backend con Flask

## 📋 Descripción
API REST para gestionar una biblioteca con funcionalidades de:
- Gestión de clientes
- Gestión de libros
- Préstamos y devoluciones

## 🛠️ Requisitos previos
- Python 3.8+
- MySQL 5.7+
- pip (gestor de paquetes de Python)

## 📦 Instalación

### 1. Crear la base de datos MySQL
```sql
CREATE DATABASE biblioteca_db;
USE biblioteca_db;
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

O dentro del virtual environment:
```bash
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3. Configurar variables de entorno
Editar el archivo `.env` con tus credenciales de MySQL:
```
DATABASE_USER=root
DATABASE_PASSWORD=tu_contraseña
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=biblioteca_db
```

### 4. Ejecutar el servidor
```bash
python main.py
```

O dentro del virtual environment:
```bash
.\venv\Scripts\python.exe main.py
```

El servidor estará disponible en: **http://localhost:5000**

## 📚 Endpoints principales

### Clientes
- `POST /api/clientes/` - Crear cliente
- `GET /api/clientes/` - Listar clientes
- `GET /api/clientes/{id}` - Obtener cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente

### Libros
- `POST /api/libros/` - Crear libro
- `GET /api/libros/` - Listar libros
- `GET /api/libros/{id}` - Obtener libro
- `PUT /api/libros/{id}` - Actualizar libro
- `DELETE /api/libros/{id}` - Eliminar libro

### Préstamos
- `POST /api/prestamos/` - Crear préstamo (asignar libro a cliente)
- `GET /api/prestamos/` - Listar préstamos
- `GET /api/prestamos/{id}` - Obtener préstamo
- `PUT /api/prestamos/{id}` - Registrar devolución
- `DELETE /api/prestamos/{id}` - Eliminar préstamo

## 🔗 Ejemplo de uso

### Crear un cliente
```bash
curl -X POST "http://localhost:5000/api/clientes/" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\": \"Juan Pérez\", \"email\": \"juan@example.com\", \"telefono\": \"1234567890\"}"
```

### Crear un libro
```bash
curl -X POST "http://localhost:5000/api/libros/" \
  -H "Content-Type: application/json" \
  -d "{\"titulo\": \"El Quijote\", \"autor\": \"Cervantes\", \"categoria\": \"Clásicos\", \"descripcion\": \"Novela clásica española\"}"
```

### Crear un préstamo
```bash
curl -X POST "http://localhost:5000/api/prestamos/" \
  -H "Content-Type: application/json" \
  -d "{\"cliente_id\": 1, \"libro_id\": 1}"
```

## ✅ Notas importantes
- Los libros se marcan automáticamente como no disponibles cuando son prestados
- Se recuperan como disponibles al registrar su devolución
- El email de clientes debe ser único
- Todos los datos son requeridos excepto los marcados como opcionales
- El servidor corre en puerto 5000 por defecto

## 🗂️ Estructura del proyecto
```
BACKEND/
├── app/
│   ├── models/          # Modelos SQLAlchemy
│   ├── routes/          # Blueprints de Flask
│   ├── database.py      # Configuración de BD
│   └── __init__.py
├── venv/                # Ambiente virtual
├── main.py              # Punto de entrada
├── requirements.txt     # Dependencias
├── .env                 # Variables de entorno
├── setup_database.sql   # Script SQL
└── README.md
```

---
Desarrollado con ❤️ usando Flask y SQLAlchemy

