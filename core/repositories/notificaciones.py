"""Repositorio de notificaciones del sistema."""

import sqlite3


class NotificacionesRepository:
    """Acceso a datos de la tabla `notificaciones`."""

    def __init__(self, db: sqlite3.Connection) -> None:
        self.db = db

    def listar(self, solo_no_leidas: bool = False) -> list[dict]:
        """Retorna notificaciones ordenadas por fecha descendente."""
        query = (
            "SELECT id, tipo, titulo, mensaje, leida, creada_en, referencia "
            "FROM notificaciones"
        )
        params: tuple = ()
        if solo_no_leidas:
            query += " WHERE leida = 0"
        query += " ORDER BY creada_en DESC, id DESC"
        rows = self.db.execute(query, params).fetchall()
        return [dict(row) for row in rows]

    def contar_no_leidas(self) -> int:
        """Retorna la cantidad de notificaciones no leídas."""
        row = self.db.execute(
            "SELECT COUNT(*) AS total FROM notificaciones WHERE leida = 0"
        ).fetchone()
        return int(row["total"]) if row else 0

    def crear(
        self,
        tipo: str,
        titulo: str,
        mensaje: str,
        referencia: str | None = None,
    ) -> int:
        """Inserta una nueva notificación y retorna su id."""
        cursor = self.db.execute(
            "INSERT INTO notificaciones (tipo, titulo, mensaje, referencia) "
            "VALUES (?, ?, ?, ?)",
            (tipo, titulo, mensaje, referencia),
        )
        self.db.commit()
        return int(cursor.lastrowid)

    def marcar_leida(self, notificacion_id: int) -> bool:
        """Marca una notificación como leída. Retorna True si se actualizó."""
        cursor = self.db.execute(
            "UPDATE notificaciones SET leida = 1 WHERE id = ? AND leida = 0",
            (notificacion_id,),
        )
        self.db.commit()
        return cursor.rowcount > 0

    def marcar_todas_leidas(self) -> int:
        """Marca todas las notificaciones como leídas. Retorna cuántas se actualizaron."""
        cursor = self.db.execute(
            "UPDATE notificaciones SET leida = 1 WHERE leida = 0"
        )
        self.db.commit()
        return cursor.rowcount
