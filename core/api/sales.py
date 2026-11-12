"""Endpoints REST de ventas y punto de venta."""

from dataclasses import asdict
from flask import Blueprint, g, jsonify, request

from core import exceptions, services
from core.models import VentaItem

bp = Blueprint("sales", __name__)


@bp.get("/api/sales")
def listar_ventas():
    """Lista el historial de ventas con sus ítems."""
    ventas = services.VentasService(g.db).listar_ventas()
    return jsonify([asdict(venta) for venta in ventas]), 200


@bp.post("/api/sales")
def registrar_venta():
    """Registra una venta con transacción atómica sobre el stock."""
    data = request.get_json(silent=True) or {}
    items_data = data.get("items")
    if not items_data:
        return jsonify({"error": "La venta debe contener al menos un ítem", "codigo": "VALIDACION"}), 400
    items = [
        VentaItem(
            sku=item_data.get("sku") or "",
            cantidad=int(item_data.get("cantidad") or 0),
            precio_unitario=float(item_data.get("precio_unitario") or 0),
        )
        for item_data in items_data
        if isinstance(item_data, dict)
    ]
    try:
        venta = services.VentasService(g.db).registrar_venta(items)
    except exceptions.StockInsuficienteError as error:
        servicios = services.NotificacionesService(g.db)
        servicios.generar_error(
            titulo="Stock insuficiente en venta",
            mensaje=str(error),
            referencia=", ".join(item_data.get("sku", "") for item_data in items_data if isinstance(item_data, dict)),
        )
        return jsonify({"error": str(error), "codigo": "STOCK_INSUFICIENTE"}), 409
    except exceptions.ValidacionError as error:
        return jsonify({"error": str(error), "codigo": "VALIDACION"}), 400
    return jsonify(asdict(venta)), 201
