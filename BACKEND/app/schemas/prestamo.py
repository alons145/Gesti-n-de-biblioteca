from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from .cliente import ClienteRead
from .libro import LibroRead

class PrestamoCreate(BaseModel):
    cliente_id: int
    libro_id: int
    fecha_devolucion_esperada: Optional[date] = None

class PrestamoUpdate(BaseModel):
    fecha_devolucion_real: Optional[date] = None

class PrestamoRead(BaseModel):
    id: int
    cliente_id: int
    libro_id: int
    fecha_prestamo: datetime
    fecha_devolucion_esperada: Optional[date] = None
    fecha_devolucion_real: Optional[date] = None
    cliente: Optional[ClienteRead] = None
    libro: Optional[LibroRead] = None
    
    class Config:
        from_attributes = True
