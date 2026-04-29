from flask import Blueprint, request, jsonify
from app.database import db
from app.models.prestamo import Prestamo
from app.models.libro import Libro
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt

prestamos_bp = Blueprint('prestamos', __name__, url_prefix='/api/prestamos')

@prestamos_bp.route('/', methods=['POST'])
@jwt_required()
def crear_prestamo():
    """Crear un nuevo préstamo (asignar libro a cliente)"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('cliente_id') or not data.get('libro_id'):
            return jsonify({"error": "cliente_id y libro_id son requeridos"}), 400
        
        # Validar que el libro existe y está disponible
        libro = Libro.query.get(data['libro_id'])
        if not libro:
            return jsonify({"error": "Libro no encontrado"}), 404
        if not libro.disponible:
            return jsonify({"error": "Libro no disponible"}), 400
        
        # Crear préstamo y marcar libro como no disponible
        prestamo = Prestamo(
            cliente_id=data['cliente_id'],
            libro_id=data['libro_id'],
            fecha_devolucion_esperada=data.get('fecha_devolucion_esperada')
        )
        
        libro.disponible = False
        db.session.add(prestamo)
        db.session.commit()
        
        return jsonify(prestamo.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@prestamos_bp.route('/', methods=['GET'])
@jwt_required()
def listar_prestamos():
    """Listar todos los préstamos"""
    try:
        # Usar joinedload para eager loading de relaciones
        from sqlalchemy.orm import joinedload
        prestamos = Prestamo.query.options(
            joinedload(Prestamo.cliente),
            joinedload(Prestamo.libro)
        ).all()
        
        # Construir respuesta manualmente para evitar problemas de serialización
        resultado = []
        for p in prestamos:
            resultado.append({
                "id": p.id,
                "cliente_id": p.cliente_id,
                "libro_id": p.libro_id,
                "fecha_prestamo": p.fecha_prestamo.isoformat() if p.fecha_prestamo else None,
                "fecha_devolucion_esperada": p.fecha_devolucion_esperada.isoformat() if p.fecha_devolucion_esperada else None,
                "fecha_devolucion_real": p.fecha_devolucion_real.isoformat() if p.fecha_devolucion_real else None,
                "cliente": {
                    "id": p.cliente.id,
                    "nombre": p.cliente.nombre,
                    "email": p.cliente.email
                } if p.cliente else None,
                "libro": {
                    "id": p.libro.id,
                    "titulo": p.libro.titulo,
                    "disponible": p.libro.disponible
                } if p.libro else None
            })
        
        return jsonify(resultado), 200
    except Exception as e:
        import traceback
        return jsonify({"error": f"Error al listar préstamos: {str(e)}", "trace": traceback.format_exc()}), 500

@prestamos_bp.route('/<int:prestamo_id>', methods=['GET'])
@jwt_required()
def obtener_prestamo(prestamo_id):
    """Obtener préstamo por ID"""
    try:
        prestamo = Prestamo.query.get(prestamo_id)
        if not prestamo:
            return jsonify({"error": "Préstamo no encontrado"}), 404
        return jsonify(prestamo.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@prestamos_bp.route('/<int:prestamo_id>', methods=['PUT'])
@jwt_required()
def devolver_libro(prestamo_id):
    """Registrar devolución de libro"""
    try:
        prestamo = Prestamo.query.get(prestamo_id)
        if not prestamo:
            return jsonify({"error": "Préstamo no encontrado"}), 404
        
        data = request.get_json()
        
        # Actualizar fecha de devolución
        if 'fecha_devolucion_real' in data:
            prestamo.fecha_devolucion_real = data['fecha_devolucion_real']
            
            # Marcar libro como disponible nuevamente
            libro = Libro.query.get(prestamo.libro_id)
            if libro:
                libro.disponible = True
        
        db.session.commit()
        return jsonify(prestamo.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@prestamos_bp.route('/<int:prestamo_id>', methods=['DELETE'])
@jwt_required()
def eliminar_prestamo(prestamo_id):
    """Eliminar préstamo"""
    try:
        prestamo = Prestamo.query.get(prestamo_id)
        if not prestamo:
            return jsonify({"error": "Préstamo no encontrado"}), 404
        # Solo admin puede eliminar préstamos
        claims = get_jwt()
        role = claims.get('role')
        if role != 'admin':
            return jsonify({"error": "Acceso denegado: se requiere rol admin"}), 403

        # Marcar libro como disponible si se elimina un préstamo activo
        if not prestamo.fecha_devolucion_real:
            libro = Libro.query.get(prestamo.libro_id)
            if libro:
                libro.disponible = True

        db.session.delete(prestamo)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

