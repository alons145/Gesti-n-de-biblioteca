from flask import Blueprint, request, jsonify
from app.database import db
from app.models.libro import Libro

libros_bp = Blueprint('libros', __name__, url_prefix='/api/libros')

@libros_bp.route('/', methods=['POST'])
def crear_libro():
    """Crear un nuevo libro"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('titulo') or not data.get('autor') or not data.get('categoria'):
            return jsonify({"error": "titulo, autor y categoria son requeridos"}), 400
        
        libro = Libro(
            titulo=data['titulo'],
            autor=data['autor'],
            categoria=data['categoria'],
            descripcion=data.get('descripcion'),
            disponible=data.get('disponible', True)
        )
        
        db.session.add(libro)
        db.session.commit()
        
        return jsonify(libro.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@libros_bp.route('/', methods=['GET'])
def listar_libros():
    """Listar todos los libros con filtro opcional de disponibilidad"""
    try:
        disponible = request.args.get('disponible')
        query = Libro.query
        
        if disponible is not None:
            disponible = disponible.lower() == 'true'
            query = query.filter_by(disponible=disponible)
        
        libros = query.all()
        return jsonify([l.to_dict() for l in libros]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@libros_bp.route('/<int:libro_id>', methods=['GET'])
def obtener_libro(libro_id):
    """Obtener libro por ID"""
    try:
        libro = Libro.query.get(libro_id)
        if not libro:
            return jsonify({"error": "Libro no encontrado"}), 404
        return jsonify(libro.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@libros_bp.route('/<int:libro_id>', methods=['PUT'])
def actualizar_libro(libro_id):
    """Actualizar libro"""
    try:
        libro = Libro.query.get(libro_id)
        if not libro:
            return jsonify({"error": "Libro no encontrado"}), 404
        
        data = request.get_json()
        
        if 'titulo' in data:
            libro.titulo = data['titulo']
        if 'autor' in data:
            libro.autor = data['autor']
        if 'categoria' in data:
            libro.categoria = data['categoria']
        if 'descripcion' in data:
            libro.descripcion = data['descripcion']
        if 'disponible' in data:
            libro.disponible = data['disponible']
        
        db.session.commit()
        return jsonify(libro.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@libros_bp.route('/<int:libro_id>', methods=['DELETE'])
def eliminar_libro(libro_id):
    """Eliminar libro"""
    try:
        libro = Libro.query.get(libro_id)
        if not libro:
            return jsonify({"error": "Libro no encontrado"}), 404
        
        db.session.delete(libro)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

