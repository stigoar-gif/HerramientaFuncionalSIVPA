"""Repositorios de acceso a datos de ArepaStock."""

from core.repositories.inventario import InventarioRepository
from core.repositories.notificaciones import NotificacionesRepository
from core.repositories.productos import ProductoRepository
from core.repositories.ventas import VentaRepository

__all__ = [
    "InventarioRepository",
    "NotificacionesRepository",
    "ProductoRepository",
    "VentaRepository",
]
