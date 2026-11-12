"""Entidades de dominio de ArepaStock."""

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Producto:
    """Producto del catálogo con su stock y precio."""

    sku: str
    nombre: str
    descripcion: str = ""
    stock: int = 0
    precio_unitario: float = 0.0
    id: int = field(default=0, repr=False)


@dataclass
class Movimiento:
    """Registro de un movimiento de inventario."""

    id: int = field(default=0, repr=False)
    fecha_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    tipo: str = "entrada"
    sku: str = ""
    cantidad: int = 0
    stock_anterior: int = 0
    stock_resultante: int = 0
    motivo: str = ""
    referencia: str = ""
    venta_id: int | None = None


@dataclass
class VentaItem:
    """Ítem de una venta."""

    sku: str = ""
    cantidad: int = 0
    precio_unitario: float = 0.0
    subtotal: float = 0.0


@dataclass
class Venta:
    """Venta registrada con sus ítems."""

    id: int = field(default=0, repr=False)
    fecha_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    estado: str = "completada"
    total: float = 0.0
    items: list = field(default_factory=list)


@dataclass
class Notificacion:
    """Notificación del sistema."""

    id: int = field(default=0, repr=False)
    tipo: str = "info"
    titulo: str = ""
    mensaje: str = ""
    leida: bool = False
    creada_en: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    referencia: str | None = None
