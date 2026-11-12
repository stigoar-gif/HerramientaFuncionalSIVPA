"""Repositorio de movimientos de inventario."""

import sqlite3

from core import exceptions
from core.models import Movimiento
from core.repositories.productos import ProductoRepository


class InventarioRepository:
    """Acceso a datos de los movimientos y de la actualización de stock."""

    def __init__(self, db: sqlite3.Connection) -> None:
        self.db = db
        self.productos = ProductoRepository(db)

    def registrar(
        self,
        tipo: str,
        sku: str,
        cantidad: int,
        motivo: str,
        referencia: str,
        venta_id: int | None = None,
    ) -> Movimiento:
        """Aplica el movimiento de stock y persiste el registro."""
        producto = self.productos.obtener(sku)
        stock_anterior = producto.stock
        if tipo == "entrada":
            stock_resultante = stock_anterior + cantidad
        elif tipo == "salida":
            if cantidad > stock_anterior:
                raise exceptions.StockInsuficienteError(
                    f"Stock insuficiente para el producto {sku}: {stock_anterior}"
                )
            stock_resultante = stock_anterior - cantidad
        else:
            stock_resultante = cantidad
        self.db.execute(
            "UPDATE productos SET stock = ? WHERE sku = ?",
            (stock_resultante, sku),
        )
        self.db.execute(
            "INSERT INTO movimientos (fecha_utc, tipo, sku, cantidad, stock_anterior, "
            "stock_resultante, motivo, referencia, venta_id) "
            "VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)",
            (tipo, sku, cantidad, stock_anterior, stock_resultante, motivo, referencia, venta_id),
        )
        self.db.commit()
        return Movimiento(
            tipo=tipo,
            sku=sku,
            cantidad=cantidad,
            stock_anterior=stock_anterior,
            stock_resultante=stock_resultante,
            motivo=motivo,
            referencia=referencia,
            venta_id=venta_id,
        )

    def listar(self, sku: str = None) -> list[Movimiento]:
        """Retorna los movimientos, opcionalmente filtrados por SKU."""
        query = (
            "SELECT id, fecha_utc, tipo, sku, cantidad, stock_anterior, stock_resultante, "
            "motivo, referencia, venta_id FROM movimientos"
        )
        params: tuple = ()
        if sku:
            query += " WHERE sku = ?"
            params = (sku,)
        query += " ORDER BY id DESC"
        rows = self.db.execute(query, params).fetchall()
        return [self._a_entidad(row) for row in rows]

    @staticmethod
    def _a_entidad(row) -> Movimiento:
        """Convierte una fila SQLite en entidad de dominio."""
        return Movimiento(
            id=int(row["id"]),
            fecha_utc=row["fecha_utc"],
            tipo=row["tipo"],
            sku=row["sku"],
            cantidad=int(row["cantidad"]),
            stock_anterior=int(row["stock_anterior"]),
            stock_resultante=int(row["stock_resultante"]),
            motivo=row["motivo"] or "",
            referencia=row["referencia"] or "",
            venta_id=int(row["venta_id"]) if row["venta_id"] is not None else None,
        )
