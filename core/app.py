"""Punto de entrada de la API REST local de ArepaStock."""

import sqlite3

from flask import Flask, g

from core import config
from core.api import register
from core.database import connection


def create_app(config_override: dict = None) -> Flask:
    """Crea y configura la aplicación Flask de la API local."""
    app = Flask(__name__)
    app.config.update({"DB_PATH": str(config.DB_PATH)})
    if config_override:
        app.config.update(config_override)

    register(app)

    @app.before_request
    def _abrir_base_datos():
        """Abre una conexión SQLite por petición."""
        g.db = sqlite3.connect(app.config["DB_PATH"], check_same_thread=False)
        g.db.row_factory = sqlite3.Row

    @app.teardown_appcontext
    def _cerrar_base_datos(exception=None):
        """Cierra la conexión SQLite al finalizar el contexto."""
        db = g.pop("db", None)
        if db is not None:
            db.close()

    return app


def run(host: str = None, port: int = None) -> None:
    """Inicializa el esquema y arranca el servidor REST local."""
    app = create_app()
    with app.app_context():
        conexion = connection.get_connection()
        try:
            version = connection.init_db(conexion)
        finally:
            conexion.close()
    app.run(host=host or config.API_HOST, port=port or config.API_PORT)


if __name__ == "__main__":
    run()
