from main import create_app
from app.database import db
from app.models.prestamo import Prestamo
from sqlalchemy.orm import joinedload

app = create_app()
with app.app_context():
    print('Verificando préstamos en BD...')
    prestamos = Prestamo.query.options(
        joinedload(Prestamo.cliente),
        joinedload(Prestamo.libro)
    ).all()
    print(f'Total de préstamos: {len(prestamos)}')
    for p in prestamos:
        print(f'\nPréstamo {p.id}:')
        print(f'  cliente_id={p.cliente_id}, libro_id={p.libro_id}')
        print(f'  Cliente: {p.cliente.nombre if p.cliente else "None"}')
        print(f'  Libro: {p.libro.titulo if p.libro else "None"}')
        print(f'  Fechas: {p.fecha_prestamo} -> {p.fecha_devolucion_real}')
        try:
            serialized = p.to_dict()
            print(f'  Serialización OK')
        except Exception as e:
            print(f'  Serialización ERROR: {e}')
