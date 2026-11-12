"""Servicios de ventas y punto de venta."""

from core import exceptions
from core.models import Venta, VentaItem
from core.repositories import VentaRepository
from core.repositories.productos import ProductoRepository


class VentasService:
    """Orquesta el registro de ventas dentro de una transacción atómica."""

    def __init__(self, db) -> None:
        self.db = db

    def registrar_venta(self, items: list[VentaItem]) -> Venta:
        """Registra una venta validando stock y aplicando descuentos atómicos."""
        if not items:
            raise exceptions.ValidacionError("La venta debe contener al menos un ítem")
        skus = [item.sku for item in items]
        if len(set(skus)) != len(skus):
            raise exceptions.ValidacionError("Cada producto solo puede facturarse una vez por venta")
        for item in items:
            if item.cantidad <= 0:
                raise exceptions.ValidacionError("La cantidad de un ítem debe ser mayor que cero")
            producto = ProductoRepository(self.db).obtener(item.sku)
            if item.cantidad > producto.stock:
                raise exceptions.StockInsuficienteError(
                    f"Stock insuficiente para el producto {item.sku}: {producto.stock}"
                )
            item.precio_unitario = producto.precio_unitario
            item.subtotal = round(item.cantidad * item.precio_unitario, 2)
        venta = VentaRepository(self.db).crear(items)
        # Notificación automática de venta registrada (importación diferida para evitar ciclo)
        from core.services import NotificacionesService

        NotificacionesService(self.db).generar_venta(
            venta.id, venta.total, len(venta.items)
        )
        return venta

    def listar_ventas(self) -> list[Venta]:
        """Retorna el historial de ventas con sus ítems."""
        return VentaRepository(self.db).listar()
