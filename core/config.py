"""Configuración del núcleo de ArepaStock."""

from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "arepastock.db"
API_HOST = "127.0.0.1"
API_PORT = 8000
DEFAULT_SCHEMA_VERSION = 2
