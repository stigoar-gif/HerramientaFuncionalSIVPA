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


def init_db(conn: sqlite3.Connection, current_version: int = config.DEFAULT_SCHEMA_VERSION) -> int:
    """Aplica las migraciones vigentes y retorna la versión activa."""
    conn.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))
    row = conn.execute("SELECT version FROM schema_version WHERE id = 1").fetchone()
    version = int(row["version"]) if row is not None else 0
    if version < current_version:
        conn.execute(
            "INSERT INTO schema_version (id, version) VALUES (1, ?) "
            "ON CONFLICT(id) DO UPDATE SET version = excluded.version, applied_at = datetime('now')",
            (current_version,),
        )
        conn.commit()
        version = current_version
    return version
