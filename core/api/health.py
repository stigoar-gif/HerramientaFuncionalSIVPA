"""Endpoints de salud de la API local de ArepaStock."""

from flask import Blueprint, jsonify

bp = Blueprint("health", __name__)


@bp.get("/api/health")
def get_health():
    """Retorna el estado operativo del núcleo."""
    return jsonify({"status": "ok", "servicio": "arepastock"}), 200
