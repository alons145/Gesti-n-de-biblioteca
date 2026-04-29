from app.database import db
from datetime import datetime

class Prestamo(db.Model):
    __tablename__ = "prestamos"
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=False)
    libro_id = db.Column(db.Integer, db.ForeignKey("libros.id"), nullable=False)
    fecha_prestamo = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_devolucion_esperada = db.Column(db.Date, nullable=True)
    fecha_devolucion_real = db.Column(db.Date, nullable=True)
    
    # Relaciones
    cliente = db.relationship("Cliente", back_populates="prestamos")
    libro = db.relationship("Libro", back_populates="prestamos")
    
    def to_dict(self):
        try:
            return {
                "id": self.id,
                "cliente_id": self.cliente_id,
                "libro_id": self.libro_id,
                "fecha_prestamo": self.fecha_prestamo.isoformat() if self.fecha_prestamo else None,
                "fecha_devolucion_esperada": self.fecha_devolucion_esperada.isoformat() if self.fecha_devolucion_esperada else None,
                "fecha_devolucion_real": self.fecha_devolucion_real.isoformat() if self.fecha_devolucion_real else None,
                "cliente": {
                    "id": self.cliente.id,
                    "nombre": self.cliente.nombre,
                    "email": self.cliente.email
                } if self.cliente else {"id": self.cliente_id, "nombre": "Unknown"},
                "libro": {
                    "id": self.libro.id,
                    "titulo": self.libro.titulo,
                    "disponible": self.libro.disponible
                } if self.libro else {"id": self.libro_id, "titulo": "Unknown"}
            }
        except Exception as e:
            # Fallback si hay error
            return {
                "id": self.id,
                "cliente_id": self.cliente_id,
                "libro_id": self.libro_id,
                "error": f"Serialization error: {str(e)}"
            }
    
    def __repr__(self):
        return f"<Prestamo cliente={self.cliente_id} libro={self.libro_id}>"

