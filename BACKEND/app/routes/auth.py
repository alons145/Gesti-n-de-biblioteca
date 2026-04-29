from flask import Blueprint, request, jsonify
from app.database import db
from app.models.user import User
from flask_jwt_extended import create_access_token
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registrar un usuario normal (role='user'). No crea admins desde aquí."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        nombre = data.get('nombre')

        if not email or not password:
            return jsonify({"error": "email y password son requeridos"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Usuario ya existe"}), 400

        user = User(email=email, nombre=nombre, role='user')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Autenticar usuario y devolver access token JWT con rol en los claims."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "email y password son requeridos"}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Credenciales inválidas"}), 401

        additional_claims = {"role": user.role}
        # IMPORTANTE: identity debe ser un string en Flask-JWT-Extended
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        return jsonify({"access_token": access_token, "user": user.to_dict()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
