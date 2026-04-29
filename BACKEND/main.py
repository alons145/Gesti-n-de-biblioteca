from flask import Flask, jsonify
from flask_cors import CORS
from app.database import init_db, db
from app.routes.clientes import clientes_bp
from app.routes.libros import libros_bp
from app.routes.prestamos import prestamos_bp
from app.routes.auth import auth_bp
from flask_jwt_extended import JWTManager
import os



def create_app():
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Cargar configuración sensible desde .env
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-me')
    app.config['JSON_SORT_KEYS'] = False
    app.url_map.strict_slashes = False

    # Inicializar CORS PRIMERO (antes de cualquier blueprint)
    CORS(app, 
         resources={r"/api/*": {
             "origins": ["http://localhost:5173", "http://localhost:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type"],
             "supports_credentials": True,
             "max_age": 3600
         }})
    
    # Inicializar JWT
    jwt = JWTManager()
    jwt.init_app(app)

    # Inicializar la base de datos
    init_db(app)

    # Crear el esquema completo si no existe y crear admin inicial si se configuran variables
    with app.app_context():
        from app.models.cliente import Cliente
        from app.models.libro import Libro
        from app.models.prestamo import Prestamo
        from app.models.user import User

        # Asegurar que todas las tablas del dominio existan antes de servir requests
        _ = Cliente, Libro, Prestamo, User
        db.create_all()

        # Crear administrador inicial si las variables de entorno están presentes
        admin_email = os.getenv('ADMIN_EMAIL')
        admin_password = os.getenv('ADMIN_PASSWORD')
        if admin_email and admin_password:
            if not User.query.filter_by(email=admin_email).first():
                admin = User(email=admin_email, nombre=os.getenv('ADMIN_NAME', 'admin'), role='admin')
                admin.set_password(admin_password)
                db.session.add(admin)
                db.session.commit()
    
    # Registrar blueprints
    app.register_blueprint(clientes_bp)
    app.register_blueprint(libros_bp)
    app.register_blueprint(prestamos_bp)
    app.register_blueprint(auth_bp)
    
    # Rutas raíz
    @app.route('/')
    def index():
        """Bienvenida a la API de Biblioteca"""
        return jsonify({
            "mensaje": "Bienvenido a la API de Biblioteca",
            "version": "1.0.0",
            "endpoints": {
                "clientes": "/api/clientes",
                "libros": "/api/libros",
                "prestamos": "/api/prestamos",
            }
        }), 200
    
    @app.route('/health')
    def health_check():
        """Verificar que el servidor está activo"""
        return jsonify({"status": "ok", "service": "Biblioteca API"}), 200
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)

