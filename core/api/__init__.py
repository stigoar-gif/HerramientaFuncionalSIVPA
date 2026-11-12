"""Blueprint y registro de la API REST local de ArepaStock."""

from flask import Blueprint

from core.api import health, inventory, notifications, products, sales

api = Blueprint("api", __name__)


def register(app) -> None:
    """Registra los blueprints de la API en la aplicación Flask."""
    app.register_blueprint(health.bp)
    app.register_blueprint(products.bp)
    app.register_blueprint(inventory.bp)
    app.register_blueprint(sales.bp)
    app.register_blueprint(notifications.bp)
