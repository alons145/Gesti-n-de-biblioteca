from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LibroCreate(BaseModel):
    titulo: str
    autor: str
    categoria: str
    descripcion: Optional[str] = None

class LibroUpdate(BaseModel):
    titulo: Optional[str] = None
    autor: Optional[str] = None
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    disponible: Optional[bool] = None

class LibroRead(BaseModel):
    id: int
    titulo: str
    autor: str
    categoria: str
    descripcion: Optional[str] = None
    disponible: bool
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
