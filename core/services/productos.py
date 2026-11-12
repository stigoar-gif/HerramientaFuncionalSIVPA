"""Servicios de productos y catálogo."""

from core import exceptions
from core.models import Producto
from core.repositories import ProductoRepository


class ProductosService:
    """Orquesta las operaciones de productos y catálogo."""

    def __init__(self, db) -> None:
        self.db = db
        self.repository = ProductoRepository(db)

    def _notificar_stock_bajo(self, producto: Producto) -> None:
        """Genera notificación de stock bajo si el producto está bajo el umbral."""
        from core.services import NotificacionesService  # importación diferida

        NotificacionesService(self.db).generar_stock_bajo(
            producto.sku, producto.nombre, producto.stock
        )

    def listar(self) -> list[Producto]:
        """Retorna el catálogo completo."""
        return self.repository.listar()

    def obtener(self, sku: str) -> Producto:
        """Retorna un producto por SKU."""
        return self.repository.obtener(sku)

    def registrar(self, data: dict) -> Producto:
        """Registra un nuevo producto en el catálogo."""
        sku = (data.get("sku") or "").strip()
        nombre = (data.get("nombre") or "").strip()
        if not sku:
            raise exceptions.ValidacionError("El SKU es obligatorio")
        if not nombre:
            raise exceptions.ValidacionError("El nombre es obligatorio")
        stock = int(data.get("stock") or 0)
        precio_unitario = float(data.get("precio_unitario") or 0)
        producto = self.repository.crear(
            {
                "sku": sku,
                "nombre": nombre,
                "descripcion": data.get("descripcion") or "",
                "stock": stock,
                "precio_unitario": precio_unitario,
            }
        )
        self._notificar_stock_bajo(producto)
        return producto

    def actualizar(self, sku: str, data: dict) -> Producto:
        """Actualiza los campos editables de un producto."""
        if not data:
            raise exceptions.ValidacionError("No se proporcionaron campos a actualizar")
        producto = self.repository.obtener(sku)
        if data.get("nombre"):
            producto.nombre = str(data.get("nombre"))
        if data.get("descripcion") is not None:
            producto.descripcion = str(data.get("descripcion") or "")
        if data.get("stock") is not None:
            producto.stock = int(data.get("stock") or 0)
        if data.get("precio_unitario") is not None:
            producto.precio_unitario = float(data.get("precio_unitario") or 0)
        producto = self.repository.actualizar(sku, producto)
        self._notificar_stock_bajo(producto)
        return producto
