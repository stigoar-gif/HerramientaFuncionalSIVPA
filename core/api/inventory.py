"""Endpoints REST de inventario y movimientos."""

from dataclasses import asdict
from flask import Blueprint, g, jsonify, request

from core import exceptions, services

bp = Blueprint("inventory", __name__)


@bp.get("/api/inventory/movements")
def listar_movimientos(sku: str = None):
    """Lista los movimientos de inventario, opcionalmente filtrados por SKU."""
    movimientos = services.InventarioService(g.db).listar_movimientos(sku=sku)
    return jsonify([asdict(movimiento) for movimiento in movimientos]), 200


@bp.post("/api/inventory/movements")
def registrar_movimiento():
    """Registra un movimiento de entrada, salida o ajuste de stock."""
    data = request.get_json(silent=True) or {}
    try:
        movimiento = services.InventarioService(g.db).registrar_movimiento(
            tipo=data.get("tipo"),
            sku=data.get("sku") or "",
            cantidad=int(data.get("cantidad") or 0),
            motivo=data.get("motivo") or "",
            referencia=data.get("referencia") or "",
            venta_id=data.get("venta_id") or None,
        )
    except exceptions.ProductoNoEncontradoError as error:
        return jsonify({"error": str(error), "codigo": "PRODUCTO_NO_ENCONTRADO"}), 404
    except exceptions.StockInsuficienteError as error:
        services.NotificacionesService(g.db).generar_error(
            titulo="Stock insuficiente",
            mensaje=str(error),
            referencia=data.get("sku") or "",
        )
        return jsonify({"error": str(error), "codigo": "STOCK_INSUFICIENTE"}), 409
    except exceptions.ValidacionError as error:
        return jsonify({"error": str(error), "codigo": "VALIDACION"}), 400
    return jsonify(asdict(movimiento)), 201
