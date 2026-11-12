"""Servicios de notificaciones del sistema."""

from core import exceptions
from core.repositories import NotificacionesRepository
from core.repositories.productos import ProductoRepository

UMBRAL_STOCK_BAJO = 3


class NotificacionesService:
    """Orquesta la creación y consulta de notificaciones del sistema."""

    def __init__(self, db) -> None:
        self.db = db
        self.repository = NotificacionesRepository(db)

    def listar(self, solo_no_leidas: bool = False) -> list[dict]:
        """Retorna el listado de notificaciones."""
        return self.repository.listar(solo_no_leidas=solo_no_leidas)

    def contar_no_leidas(self) -> int:
        """Retorna el total de notificaciones sin leer."""
        return self.repository.contar_no_leidas()

    def crear(
        self,
        tipo: str,
        titulo: str,
        mensaje: str,
        referencia: str | None = None,
    ) -> dict:
        """Crea una notificación y retorna sus datos."""
        notificacion_id = self.repository.crear(
            tipo=tipo, titulo=titulo, mensaje=mensaje, referencia=referencia
        )
        filas = self.db.execute(
            "SELECT id, tipo, titulo, mensaje, leida, creada_en, referencia "
            "FROM notificaciones WHERE id = ?",
            (notificacion_id,),
        ).fetchall()
        if not filas:
            raise exceptions.NotificacionNoEncontradaError(
                f"Notificación no encontrada: {notificacion_id}"
            )
        return dict(filas[0])

    def marcar_leida(self, notificacion_id: int) -> dict:
        """Marca una notificación como leída y retorna sus datos actualizados."""
        if not self.repository.marcar_leida(notificacion_id):
            raise exceptions.NotificacionNoEncontradaError(
                f"Notificación no encontrada o ya leída: {notificacion_id}"
            )
        filas = self.db.execute(
            "SELECT id, tipo, titulo, mensaje, leida, creada_en, referencia "
            "FROM notificaciones WHERE id = ?",
            (notificacion_id,),
        ).fetchall()
        return dict(filas[0])

    def marcar_todas_leidas(self) -> int:
        """Marca todas las notificaciones como leídas. Retorna cuántas se actualizaron."""
        return self.repository.marcar_todas_leidas()

    def generar_stock_bajo(self, sku: str, nombre: str, stock: int) -> dict | None:
        """Genera notificación de stock bajo si el stock está en o debajo del umbral."""
        if stock > UMBRAL_STOCK_BAJO:
            return None
        return self.crear(
            tipo="stock_bajo",
            titulo="Stock bajo",
            mensaje=(
                f"{nombre} ({sku}) tiene solo {stock} unidad(es) disponible(s)."
            ),
            referencia=sku,
        )

    def generar_venta(self, venta_id: int, total: float, items_count: int) -> dict:
        """Genera notificación de venta registrada."""
        return self.crear(
            tipo="venta",
            titulo="Venta registrada",
            mensaje=(
                f"Venta #{venta_id} completada por ${total:.2f} "
                f"con {items_count} ítem(es)."
            ),
            referencia=str(venta_id),
        )

    def generar_error(
        self,
        titulo: str,
        mensaje: str,
        referencia: str | None = None,
    ) -> dict:
        """Genera notificación de error del sistema."""
        return self.crear(
            tipo="error",
            titulo=titulo,
            mensaje=mensaje,
            referencia=referencia,
        )
