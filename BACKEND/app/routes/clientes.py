from flask import Blueprint, request, jsonify
from app.database import db
from app.models.cliente import Cliente

clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

@clientes_bp.route('/', methods=['POST'])
def crear_cliente():
    """Crear un nuevo cliente"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('nombre') or not data.get('email'):
            return jsonify({"error": "nombre y email son requeridos"}), 400
        
        # Verificar si email ya existe
        if Cliente.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email ya registrado"}), 400
        
        cliente = Cliente(
            nombre=data['nombre'],
            email=data['email'],
            telefono=data.get('telefono'),
            direccion=data.get('direccion')
        )
        
        db.session.add(cliente)
        db.session.commit()
        
        return jsonify(cliente.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clientes_bp.route('/', methods=['GET'])
def listar_clientes():
    """Listar todos los clientes"""
    try:
        clientes = Cliente.query.all()
        return jsonify([c.to_dict() for c in clientes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@clientes_bp.route('/<int:cliente_id>', methods=['GET'])
def obtener_cliente(cliente_id):
    """Obtener cliente por ID"""
    try:
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404
        return jsonify(cliente.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@clientes_bp.route('/<int:cliente_id>', methods=['PUT'])
def actualizar_cliente(cliente_id):
    """Actualizar cliente"""
    try:
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404
        
        data = request.get_json()
        
        if 'nombre' in data:
            cliente.nombre = data['nombre']
        if 'email' in data:
            # Verificar que el nuevo email no existe
            if data['email'] != cliente.email and Cliente.query.filter_by(email=data['email']).first():
                return jsonify({"error": "Email ya registrado"}), 400
            cliente.email = data['email']
        if 'telefono' in data:
            cliente.telefono = data['telefono']
        if 'direccion' in data:
            cliente.direccion = data['direccion']
        
        db.session.commit()
        return jsonify(cliente.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clientes_bp.route('/<int:cliente_id>', methods=['DELETE'])
def eliminar_cliente(cliente_id):
    """Eliminar cliente"""
    try:
        cliente = Cliente.query.get(cliente_id)
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404
        
        db.session.delete(cliente)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

