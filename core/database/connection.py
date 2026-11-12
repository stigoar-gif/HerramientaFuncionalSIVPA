"""Conexión SQLite y migraciones versionadas del núcleo ArepaStock."""

import sqlite3
from pathlib import Path

from core import config

SCHEMA_FILE = Path(__file__).resolve().parent / "schema.sql"


def open_connection(db_path) -> sqlite3.Connection:
    """Abre una conexión SQLite con WAL y claves foráneas activadas."""
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_connection():
    """Devuelve una nueva conexión SQLite usando la ruta configurada."""
    return open_connection(config.DB_PATH)


def _column_exists(conn: sqlite3.Connection, table: str, column: str) -> bool:
    """Verifica si una columna existe en una tabla."""
    row = conn.execute(
        "PRAGMA table_info(%s)" % table
    ).fetchall()
    return any(r["name"] == column for r in row)


def _apply_migration_v2_to_v3(conn: sqlite3.Connection) -> None:
    """Agrega la columna 'imagen' a la tabla 'productos' si no existe."""
    if not _column_exists(conn, "productos", "imagen"):
        conn.execute("ALTER TABLE productos ADD COLUMN imagen TEXT")
        conn.commit()


def init_db(conn: sqlite3.Connection, current_version: int = config.DEFAULT_SCHEMA_VERSION) -> int:
    """Aplica las migraciones vigentes y retorna la versión activa."""
    conn.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))

    row = conn.execute("SELECT version FROM schema_version WHERE id = 1").fetchone()
    version = int(row["version"]) if row is not None else 0

    # Migración V1 -> V2: tabla notificaciones (ya en schema.sql, CREATE TABLE IF NOT EXISTS)
    # Migración V2 -> V3: agregar columna imagen a productos
    if version < 3:
        _apply_migration_v2_to_v3(conn)

    if version < current_version:
        conn.execute(
            "INSERT INTO schema_version (id, version) VALUES (1, ?) "
            "ON CONFLICT(id) DO UPDATE SET version = excluded.version, applied_at = datetime('now')",
            (current_version,),
        )
        conn.commit()
        version = current_version
    return version
