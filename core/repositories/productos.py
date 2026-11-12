"""Repositorio de productos del catálogo."""

import sqlite3

from core import exceptions
from core.models import Producto


class ProductoRepository:
    """Acceso a datos de la tabla `productos`."""

    def __init__(self, db: sqlite3.Connection) -> None:
        self.db = db

    def listar(self) -> list[Producto]:
        """Retorna todos los productos ordenados por SKU."""
        rows = self.db.execute(
            "SELECT id, sku, nombre, descripcion, stock, precio_unitario "
            "FROM productos ORDER BY sku"
        ).fetchall()
        return [self._a_entidad(row) for row in rows]

    def obtener(self, sku: str) -> Producto:
        """Retorna un producto por su SKU o lanza error de dominio."""
        row = self.db.execute(
            "SELECT id, sku, nombre, descripcion, stock, precio_unitario "
            "FROM productos WHERE sku = ?",
            (sku,),
        ).fetchone()
        if row is None:
            raise exceptions.ProductoNoEncontradoError(f"Producto no encontrado: {sku}")
        return self._a_entidad(row)

    def crear(self, data: dict) -> Producto:
        """Inserta un nuevo producto."""
        sku = (data.get("sku") or "").strip()
        nombre = (data.get("nombre") or "").strip()
        if not sku:
            raise exceptions.ValidacionError("El SKU es obligatorio")
        if not nombre:
            raise exceptions.ValidacionError("El nombre es obligatorio")
        stock = int(data.get("stock") or 0)
        precio_unitario = float(data.get("precio_unitario") or 0)
        try:
            self.db.execute(
                "INSERT INTO productos (sku, nombre, descripcion, stock, precio_unitario) "
                "VALUES (?, ?, ?, ?, ?)",
                (sku, nombre, data.get("descripcion") or "", stock, precio_unitario),
            )
            self.db.commit()
        except sqlite3.IntegrityError as exc:
            self.db.rollback()
            raise exceptions.ProductoDuplicadoError(f"SKU duplicado: {sku}") from exc
        return self.obtener(sku)

    def actualizar(self, sku: str, producto: Producto) -> Producto:
        """Actualiza los campos editables de un producto."""
        self.db.execute(
            "UPDATE productos SET nombre = ?, descripcion = ?, stock = ?, precio_unitario = ? "
            "WHERE sku = ?",
            (producto.nombre, producto.descripcion, producto.stock, producto.precio_unitario, sku),
        )
        self.db.commit()
        return self.obtener(sku)

    @staticmethod
    def _a_entidad(row) -> Producto:
        """Convierte una fila SQLite en entidad de dominio."""
        return Producto(
            sku=row["sku"],
            nombre=row["nombre"],
            descripcion=row["descripcion"],
            stock=int(row["stock"]),
            precio_unitario=float(row["precio_unitario"]),
            id=int(row["id"]),
        )
