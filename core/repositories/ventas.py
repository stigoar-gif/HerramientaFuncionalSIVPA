"""Repositorio de ventas y sus ítems."""

import sqlite3

from core.models import Movimiento, Venta, VentaItem
from core.repositories.productos import ProductoRepository


class VentaRepository:
    """Acceso a datos de ventas, ítems y movimientos de salida."""

    def __init__(self, db: sqlite3.Connection) -> None:
        self.db = db

    def crear(self, items: list[VentaItem]) -> Venta:
        """Crea una venta y sus ítems dentro de una transacción ACID."""
        total = round(sum(item.subtotal for item in items), 2)
        self.db.execute(
            "INSERT INTO ventas (fecha_utc, estado, total) VALUES (datetime('now'), 'completada', ?)",
            (total,),
        )
        venta_id = int(self.db.execute("SELECT last_insert_rowid() AS id").fetchone()["id"])
        for item in items:
            self.db.execute(
                "INSERT INTO venta_items (venta_id, sku, cantidad, precio_unitario, subtotal) "
                "VALUES (?, ?, ?, ?, ?)",
                (venta_id, item.sku, item.cantidad, item.precio_unitario, item.subtotal),
            )
            producto_repo = ProductoRepository(self.db)
            producto = producto_repo.obtener(item.sku)
            stock_anterior = producto.stock
            stock_resultante = stock_anterior - item.cantidad
            self.db.execute(
                "UPDATE productos SET stock = ? WHERE sku = ?",
                (stock_resultante, item.sku),
            )
            self.db.execute(
                "INSERT INTO movimientos (fecha_utc, tipo, sku, cantidad, stock_anterior, "
                "stock_resultante, motivo, referencia, venta_id) "
                "VALUES (datetime('now'), 'salida', ?, ?, ?, ?, ?, ?, ?)",
                (item.sku, item.cantidad, stock_anterior, stock_resultante, "Venta", f"VENTA-{venta_id}", venta_id),
            )
        self.db.commit()
        fecha_utc = self.db.execute(
            "SELECT fecha_utc FROM ventas WHERE id = ?", (venta_id,)
        ).fetchone()["fecha_utc"]
        return Venta(id=venta_id, fecha_utc=fecha_utc, estado="completada", total=total, items=list(items))

    def listar(self) -> list[Venta]:
        """Retorna el historial de ventas con sus ítems."""
        ventas_rows = self.db.execute(
            "SELECT id, fecha_utc, estado, total FROM ventas ORDER BY id DESC"
        ).fetchall()
        ventas: list[Venta] = []
        for row in ventas_rows:
            items_rows = self.db.execute(
                "SELECT sku, cantidad, precio_unitario, subtotal FROM venta_items "
                "WHERE venta_id = ? ORDER BY id",
                (row["id"],),
            ).fetchall()
            venta = Venta(
                id=int(row["id"]),
                fecha_utc=row["fecha_utc"],
                estado=row["estado"],
                total=float(row["total"]),
            )
            venta.items = [
                VentaItem(
                    sku=item_row["sku"],
                    cantidad=int(item_row["cantidad"]),
                    precio_unitario=float(item_row["precio_unitario"]),
                    subtotal=float(item_row["subtotal"]),
                )
                for item_row in items_rows
            ]
            ventas.append(venta)
        return ventas
