"""Endpoints REST de productos del catálogo."""

from dataclasses import asdict
from flask import Blueprint, g, jsonify, request

from core import exceptions, services

bp = Blueprint("products", __name__)


@bp.get("/api/products")
def listar_productos():
    """Lista el catálogo completo de productos."""
    productos = services.ProductosService(g.db).listar()
    return jsonify([asdict(producto) for producto in productos]), 200


@bp.post("/api/products")
def crear_producto():
    """Registra un nuevo producto en el catálogo."""
    data = request.get_json(silent=True) or {}
    try:
        producto = services.ProductosService(g.db).registrar(data)
    except exceptions.ProductoDuplicadoError as error:
        return jsonify({"error": str(error), "codigo": "PRODUCTO_DUPLICADO"}), 409
    except exceptions.ValidacionError as error:
        return jsonify({"error": str(error), "codigo": "VALIDACION"}), 400
    return jsonify(asdict(producto)), 201


@bp.get("/api/products/<string:sku>")
def obtener_producto(sku: str):
    """Retorna un producto por su SKU."""
    try:
        producto = services.ProductosService(g.db).obtener(sku)
    except exceptions.ProductoNoEncontradoError as error:
        return jsonify({"error": str(error), "codigo": "PRODUCTO_NO_ENCONTRADO"}), 404
    return jsonify(asdict(producto)), 200


@bp.put("/api/products/<string:sku>")
def actualizar_producto(sku: str):
    """Actualiza los campos editables de un producto."""
    data = request.get_json(silent=True) or {}
    try:
        producto = services.ProductosService(g.db).actualizar(sku, data)
    except exceptions.ProductoNoEncontradoError as error:
        return jsonify({"error": str(error), "codigo": "PRODUCTO_NO_ENCONTRADO"}), 404
    except exceptions.ValidacionError as error:
        return jsonify({"error": str(error), "codigo": "VALIDACION"}), 400
    return jsonify(asdict(producto)), 200
