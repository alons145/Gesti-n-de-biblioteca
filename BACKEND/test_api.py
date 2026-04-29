#!/usr/bin/env python
"""Script para probar los endpoints de la API"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def print_response(name, response):
    """Imprimir respuesta formateada"""
    print(f"\n{'='*60}")
    print(f"✓ {name}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)

# 1. Health Check
try:
    response = requests.get("http://localhost:5000/health")
    print_response("Health Check", response)
except Exception as e:
    print(f"✗ Error en Health Check: {e}")

# 2. Crear clientes
print("\n" + "="*60)
print("PRUEBAS DE CLIENTES")
print("="*60)

clientes_data = [
    {
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "telefono": "1234567890",
        "direccion": "Calle Principal 123"
    },
    {
        "nombre": "María García",
        "email": "maria@example.com",
        "telefono": "0987654321",
        "direccion": "Avenida Central 456"
    }
]

cliente_ids = []
for cliente in clientes_data:
    try:
        response = requests.post(f"{BASE_URL}/clientes/", json=cliente)
        print_response(f"Crear cliente: {cliente['nombre']}", response)
        if response.status_code == 201:
            cliente_ids.append(response.json()['id'])
    except Exception as e:
        print(f"✗ Error: {e}")

# 3. Listar clientes
try:
    response = requests.get(f"{BASE_URL}/clientes/")
    print_response("Listar clientes", response)
except Exception as e:
    print(f"✗ Error: {e}")

# 4. Crear libros
print("\n" + "="*60)
print("PRUEBAS DE LIBROS")
print("="*60)

libros_data = [
    {
        "titulo": "El Quijote",
        "autor": "Miguel de Cervantes",
        "categoria": "Clásicos",
        "descripcion": "Novela clásica española que cuenta las aventuras de Don Quijote"
    },
    {
        "titulo": "Cien años de soledad",
        "autor": "Gabriel García Márquez",
        "categoria": "Realismo Mágico",
        "descripcion": "Novela que narra la historia de la familia Buendía en Macondo"
    },
    {
        "titulo": "1984",
        "autor": "George Orwell",
        "categoria": "Distopía",
        "descripcion": "Novela distópica sobre un régimen totalitario"
    }
]

libro_ids = []
for libro in libros_data:
    try:
        response = requests.post(f"{BASE_URL}/libros/", json=libro)
        print_response(f"Crear libro: {libro['titulo']}", response)
        if response.status_code == 201:
            libro_ids.append(response.json()['id'])
    except Exception as e:
        print(f"✗ Error: {e}")

# 5. Listar libros
try:
    response = requests.get(f"{BASE_URL}/libros/")
    print_response("Listar libros", response)
except Exception as e:
    print(f"✗ Error: {e}")

# 6. Listar libros disponibles
try:
    response = requests.get(f"{BASE_URL}/libros/?disponible=true")
    print_response("Listar libros disponibles", response)
except Exception as e:
    print(f"✗ Error: {e}")

# 7. Crear préstamos
print("\n" + "="*60)
print("PRUEBAS DE PRÉSTAMOS")
print("="*60)

if cliente_ids and libro_ids:
    prestamo_data = {
        "cliente_id": cliente_ids[0],
        "libro_id": libro_ids[0],
        "fecha_devolucion_esperada": "2026-05-29"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/prestamos/", json=prestamo_data)
        print_response("Crear préstamo", response)
        if response.status_code == 201:
            prestamo_id = response.json()['id']
            
            # 8. Listar préstamos
            try:
                response = requests.get(f"{BASE_URL}/prestamos/")
                print_response("Listar préstamos", response)
            except Exception as e:
                print(f"✗ Error: {e}")
            
            # 9. Obtener préstamo específico
            try:
                response = requests.get(f"{BASE_URL}/prestamos/{prestamo_id}")
                print_response(f"Obtener préstamo {prestamo_id}", response)
            except Exception as e:
                print(f"✗ Error: {e}")
    except Exception as e:
        print(f"✗ Error: {e}")

print("\n" + "="*60)
print("✓ Pruebas completadas")
print("="*60)
