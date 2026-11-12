"""Endpoints REST de notificaciones del sistema."""

from flask import Blueprint, g, jsonify, request

from core import exceptions, services

bp = Blueprint("notifications", __name__)


@bp.get("/api/notificaciones")
def listar_notificaciones():
    """Lista las notificaciones del sistema.

    Query params:
        solo_no_leidas (str): "true" para solo no leídas, "false" para todas.
    """
    solo_no_leidas = request.args.get("solo_no_leidas", "false").lower() == "true"
    notificaciones = services.NotificacionesService(g.db).listar(
        solo_no_leidas=solo_no_leidas
    )
    return jsonify(notificaciones), 200


@bp.get("/api/notificaciones/contar-no-leidas")
def contar_no_leidas():
    """Retorna el total de notificaciones sin leer."""
    total = services.NotificacionesService(g.db).contar_no_leidas()
    return jsonify({"total": total}), 200


@bp.post("/api/notificaciones/<int:notificacion_id>/leer")
def marcar_leida(notificacion_id: int):
    """Marca una notificación como leída."""
    try:
        notificacion = services.NotificacionesService(g.db).marcar_leida(
            notificacion_id
        )
    except exceptions.NotificacionNoEncontradaError as error:
        return (
            jsonify({"error": str(error), "codigo": "NOTIFICACION_NO_ENCONTRADA"}),
            404,
        )
    return jsonify(notificacion), 200


@bp.post("/api/notificaciones/leer-todas")
def marcar_todas_leidas():
    """Marca todas las notificaciones como leídas."""
    actualizadas = services.NotificacionesService(g.db).marcar_todas_leidas()
    return jsonify({"actualizadas": actualizadas}), 200
