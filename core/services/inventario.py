"""Servicios de inventario y movimientos."""

from core import exceptions
from core.models import Movimiento
from core.repositories import InventarioRepository
from core.repositories.productos import ProductoRepository


class InventarioService:
    """Orquesta las operaciones de inventario y movimientos."""

    def __init__(self, db) -> None:
        self.db = db

    def registrar_movimiento(
        self,
        tipo: str,
        sku: str,
        cantidad: int,
        motivo: str = "",
        referencia: str = "",
        venta_id: int | None = None,
    ) -> Movimiento:
        """Valida y registra un movimiento de inventario."""
        if tipo not in ("entrada", "salida", "ajuste"):
            raise exceptions.ValidacionError("El tipo de movimiento debe ser entrada, salida o ajuste")
        if cantidad <= 0:
            raise exceptions.ValidacionError("La cantidad del movimiento debe ser mayor que cero")
        producto = ProductoRepository(self.db).obtener(sku)
        if tipo == "salida" and cantidad > producto.stock:
            raise exceptions.StockInsuficienteError(
                f"Stock insuficiente para el producto {sku}: {producto.stock}"
            )
        movimiento = InventarioRepository(self.db).registrar(
            tipo=tipo,
            sku=sku,
            cantidad=cantidad,
            motivo=motivo,
            referencia=referencia,
            venta_id=venta_id,
        )
        # Notificación automática de cada movimiento de inventario
        from core.services import NotificacionesService  # importación diferida (evita ciclo)

        producto_actualizado = ProductoRepository(self.db).obtener(sku)
        tipos_titulo = {
            "entrada": "Entrada de stock",
            "salida": "Salida de stock",
            "ajuste": "Ajuste de inventario",
        }
        NotificacionesService(self.db).crear(
            tipo="info",
            titulo=tipos_titulo.get(tipo, "Movimiento de inventario"),
            mensaje=(
                f"{producto_actualizado.nombre} ({sku}): {cantidad} unidad(es) "
                f"({tipo}). Stock resultante: {producto_actualizado.stock}."
            ),
            referencia=sku,
        )
        # Notificación automática de stock bajo después del movimiento
        NotificacionesService(self.db).generar_stock_bajo(
            sku, producto_actualizado.nombre, producto_actualizado.stock
        )
        return movimiento

    def listar_movimientos(self, sku: str = None) -> list[Movimiento]:
        """Retorna el historial de movimientos, opcionalmente filtrado por SKU."""
        return InventarioRepository(self.db).listar(sku=sku)
