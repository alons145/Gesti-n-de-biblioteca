#!/usr/bin/env python
"""Script para inicializar la base de datos con datos válidos sin borrar información existente."""

import os
import sys
from datetime import datetime, timedelta

from app.database import db
from app.models.cliente import Cliente
from app.models.libro import Libro
from app.models.prestamo import Prestamo
from app.models.user import User
from main import create_app

def init_database():
    """Inicializar BD con datos de ejemplo de forma idempotente."""
    app = create_app()
    
    with app.app_context():
        db.create_all()
        def ensure_user(email, nombre, role, password):
            user = User.query.filter_by(email=email).first()
            if user:
                return user, False

            user = User(email=email, nombre=nombre, role=role)
            user.set_password(password)
            db.session.add(user)
            db.session.flush()
            return user, True

        def ensure_cliente(nombre, email, telefono, direccion):
            cliente = Cliente.query.filter_by(email=email).first()
            if cliente:
                return cliente, False

            cliente = Cliente(nombre=nombre, email=email, telefono=telefono, direccion=direccion)
            db.session.add(cliente)
            db.session.flush()
            return cliente, True

        def ensure_libro(titulo, autor, categoria, descripcion, disponible=True):
            libro = Libro.query.filter_by(titulo=titulo, autor=autor).first()
            if libro:
                return libro, False

            libro = Libro(
                titulo=titulo,
                autor=autor,
                categoria=categoria,
                descripcion=descripcion,
                disponible=disponible,
            )
            db.session.add(libro)
            db.session.flush()
            return libro, True

        def ensure_prestamo(cliente, libro, dias_esperados, dias_desde_prestamo=0, devuelto=False):
            prestamo = Prestamo.query.filter_by(cliente_id=cliente.id, libro_id=libro.id).first()
            if prestamo:
                return prestamo, False

            hoy = datetime.utcnow().date()
            prestamo = Prestamo(
                cliente_id=cliente.id,
                libro_id=libro.id,
                fecha_prestamo=datetime.utcnow() - timedelta(days=dias_desde_prestamo),
                fecha_devolucion_esperada=hoy + timedelta(days=dias_esperados),
                fecha_devolucion_real=hoy if devuelto else None,
            )
            db.session.add(prestamo)
            db.session.flush()
            return prestamo, True

        nuevos_usuarios = 0
        nuevos_clientes = 0
        nuevos_libros = 0
        nuevos_prestamos = 0

        print("👤 Verificando usuarios iniciales...")
        _, created = ensure_user('admin@biblioteca.local', 'Administrador', 'admin', 'admin123')
        nuevos_usuarios += int(created)
        _, created = ensure_user('usuario@biblioteca.local', 'Usuario Normal', 'user', 'usuario123')
        nuevos_usuarios += int(created)

        print("👥 Verificando clientes iniciales...")
        clientes = []
        for cliente_data in [
            ('Juan García', 'juan@example.com', '555-0001', 'Calle 1, 123'),
            ('María López', 'maria@example.com', '555-0002', 'Calle 2, 456'),
            ('Carlos Rodríguez', 'carlos@example.com', '555-0003', 'Calle 3, 789'),
            ('Ana Martínez', 'ana@example.com', '555-0004', 'Calle 4, 101'),
        ]:
            cliente, created = ensure_cliente(*cliente_data)
            clientes.append(cliente)
            nuevos_clientes += int(created)

        print("📚 Verificando libros iniciales...")
        libros = []
        libros_data = [
            ('El Quijote', 'Miguel de Cervantes', 'Clásicos', 'La novela más importante de la literatura española', False),
            ('Cien años de soledad', 'Gabriel García Márquez', 'Realismo Mágico', 'Obra maestra de la literatura latinoamericana', False),
            ('1984', 'George Orwell', 'Distopía', 'Novela de ciencia ficción distópica', True),
            ('El Gran Gatsby', 'F. Scott Fitzgerald', 'Clásicos', 'Novela sobre el sueño americano', True),
            ('Pride and Prejudice', 'Jane Austen', 'Romance', 'Novela romántica clásica', True),
            ('Crimen y Castigo', 'Fiódor Dostoyevski', 'Psicológica', 'Novela psicológica profunda', True),
        ]
        for libro_data in libros_data:
            libro, created = ensure_libro(*libro_data)
            libros.append(libro)
            nuevos_libros += int(created)

        print("📖 Verificando préstamos iniciales...")
        prestamos_data = [
            (clientes[0], libros[0], 14, 0, False),
            (clientes[1], libros[1], 9, 5, False),
            (clientes[2], libros[4], 4, 10, True),
        ]
        for cliente, libro, dias_esperados, dias_desde_prestamo, devuelto in prestamos_data:
            prestamo, created = ensure_prestamo(cliente, libro, dias_esperados, dias_desde_prestamo, devuelto)
            if created and not devuelto:
                libro.disponible = False
            if created and devuelto:
                libro.disponible = True
            nuevos_prestamos += int(created)

        # Mantener coherencia de disponibilidad con los préstamos activos y devueltos.
        libros[0].disponible = False
        libros[1].disponible = False
        libros[4].disponible = True

        db.session.commit()
        
        print("\n✅ Base de datos inicializada exitosamente!")
        print(f"   - {nuevos_usuarios} usuarios creados")
        print(f"   - {nuevos_clientes} clientes creados")
        print(f"   - {nuevos_libros} libros creados")
        print(f"   - {nuevos_prestamos} préstamos creados")
        print("\n📊 Datos de acceso:")
        print("   Admin: admin@biblioteca.local / admin123")
        print("   User:  usuario@biblioteca.local / usuario123")

if __name__ == '__main__':
    try:
        init_database()
    except Exception as e:
        print(f"❌ Error al inicializar BD: {e}")
        sys.exit(1)
