from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class ClienteCreate(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    direccion: Optional[str] = None

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None

class ClienteRead(BaseModel):
    id: int
    nombre: str
    email: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    fecha_registro: datetime
    
    class Config:
        from_attributes = True
