"""Pruebas del nucleo Python de ArepaStock (independiente de Electron).

Cubre: CRUD de productos, movimientos de inventario con trazabilidad,
venta atomica con descuento de stock y consistencia de datos.
"""

import os
import sqlite3
import tempfile

import pytest

from core import config
from core.database.connection import open_connection, init_db
from core.models import Producto, VentaItem
from core.repositories import (
    InventarioRepository,
    ProductoRepository,
    VentaRepository,
)
from core.services import InventarioService, ProductosService, VentasService
from core import exceptions


@pytest.fixture
def db_path():
    """Ruta a una base de datos SQLite temporal (un archivo por prueba)."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    yield path
    try:
        os.remove(path)
    except OSError:
        pass
    try:
        os.remove(path + "-wal")
    except OSError:
        pass
    try:
        os.remove(path + "-shm")
    except OSError:
        pass


@pytest.fixture
def conn(db_path):
    """Conexion abierta con esquema inicializado y catalogo semillado."""
    cn = open_connection(db_path)
    init_db(cn, config.DEFAULT_SCHEMA_VERSION)
    yield cn
    cn.close()


# ---------------- Productos ----------------

def test_listar_productos_semilla(conn):
    """El catalogo inicial debe contener los 5 SKUs definidos."""
    productos = ProductoRepository(conn).listar()
    skus = [p.sku for p in productos]
    assert "ARE-QUE-001" in skus
    assert "ARE-ALI-002" in skus
    assert "ARE-MOT-003" in skus
    assert "TOR-MOT-004" in skus
    assert "ARE-TRA-005" in skus


def test_registrar_producto(conn):
    producto = ProductosService(conn).registrar(
        {
            "sku": "TEST-001",
            "nombre": "Arepa de prueba",
            "descripcion": "Desc",
            "stock": 5,
            "precio_unitario": 4.0,
        }
    )
    assert producto.sku == "TEST-001"
    assert producto.stock == 5
    assert producto.precio_unitario == 4.0


def test_registrar_producto_duplicado(conn):
    ProductosService(conn).registrar(
        {"sku": "DUP-001", "nombre": "Uno", "stock": 1, "precio_unitario": 1.0}
    )
    with pytest.raises(exceptions.ProductoDuplicadoError):
        ProductosService(conn).registrar(
            {"sku": "DUP-001", "nombre": "Dos", "stock": 1, "precio_unitario": 1.0}
        )


def test_producto_no_encontrado(conn):
    with pytest.raises(exceptions.ProductoNoEncontradoError):
        ProductosService(conn).obtener("NO-EXISTE")


def test_actualizar_stock_y_precio(conn):
    ProductosService(conn).registrar(
        {"sku": "UPD-001", "nombre": "X", "stock": 2, "precio_unitario": 1.0}
    )
    producto = ProductosService(conn).actualizar(
        "UPD-001", {"stock": 10, "precio_unitario": 9.99}
    )
    assert producto.stock == 10
    assert producto.precio_unitario == 9.99


# ---------------- Movimientos de inventario ----------------

def test_entrada_aumenta_stock_y_traza(conn):
    ProductosService(conn).registrar(
        {"sku": "MOV-001", "nombre": "Y", "stock": 0, "precio_unitario": 1.0}
    )
    movimiento = InventarioService(conn).registrar_movimiento(
        tipo="entrada", sku="MOV-001", cantidad=7, motivo="produccion", referencia="LOTE-A"
    )
    assert movimiento.stock_anterior == 0
    assert movimiento.stock_resultante == 7
    assert movimiento.tipo == "entrada"
    assert movimiento.venta_id is None
    producto = ProductoRepository(conn).obtener("MOV-001")
    assert producto.stock == 7


def test_salida_disminuye_stock(conn):
    ProductosService(conn).registrar(
        {"sku": "MOV-002", "nombre": "Z", "stock": 5, "precio_unitario": 1.0}
    )
    InventarioService(conn).registrar_movimiento(
        tipo="salida", sku="MOV-002", cantidad=3, motivo="venta", referencia="VENTA-9"
    )
    assert ProductoRepository(conn).obtener("MOV-002").stock == 2


def test_salida_stock_insuficiente(conn):
    ProductosService(conn).registrar(
        {"sku": "MOV-003", "nombre": "W", "stock": 1, "precio_unitario": 1.0}
    )
    with pytest.raises(exceptions.StockInsuficienteError):
        InventarioService(conn).registrar_movimiento(
            tipo="salida", sku="MOV-003", cantidad=5, motivo="venta"
        )


def test_ajuste_establece_stock_absoluto(conn):
    ProductosService(conn).registrar(
        {"sku": "MOV-004", "nombre": "V", "stock": 20, "precio_unitario": 1.0}
    )
    InventarioService(conn).registrar_movimiento(
        tipo="ajuste", sku="MOV-004", cantidad=5, motivo="inventario fisico"
    )
    assert ProductoRepository(conn).obtener("MOV-004").stock == 5


def test_listar_movimientos_filtrado_por_sku(conn):
    ProductosService(conn).registrar(
        {"sku": "MOV-005", "nombre": "U", "stock": 0, "precio_unitario": 1.0}
    )
    InventarioService(conn).registrar_movimiento(
        tipo="entrada", sku="MOV-005", cantidad=4, motivo="m1"
    )
    InventarioService(conn).registrar_movimiento(
        tipo="entrada", sku="MOV-005", cantidad=2, motivo="m2"
    )
    movimientos = InventarioService(conn).listar_movimientos(sku="MOV-005")
    assert len(movimientos) == 2
    # el mas reciente primero
    assert movimientos[0].stock_resultante == 6


# ---------------- Venta (atomica) ----------------

def test_venta_descuenta_stock_y_registra_movimiento(conn):
    ProductosService(conn).registrar(
        {"sku": "VTA-001", "nombre": "Arepa Q", "stock": 10, "precio_unitario": 3.50}
    )
    venta = VentasService(conn).registrar_venta(
        [VentaItem(sku="VTA-001", cantidad=3)]
    )
    assert venta.total == 10.50
    assert venta.estado == "completada"
    assert ProductoRepository(conn).obtener("VTA-001").stock == 7
    movimientos = InventarioService(conn).listar_movimientos(sku="VTA-001")
    salida = [m for m in movimientos if m.tipo == "salida"]
    assert len(salida) == 1
    assert salida[0].cantidad == 3
    assert salida[0].venta_id == venta.id
    assert salida[0].referencia == f"VENTA-{venta.id}"


def test_venta_atomica_sin_stock_partial_no_afecta(conn):
    ProductosService(conn).registrar(
        {"sku": "VTA-002", "nombre": "Arepa A", "stock": 1, "precio_unitario": 2.0}
    )
    ProductosService(conn).registrar(
        {"sku": "VTA-003", "nombre": "Arepa M", "stock": 0, "precio_unitario": 3.0}
    )
    # un item con stock y otro sin stock: todo debe fallar
    with pytest.raises(exceptions.StockInsuficienteError):
        VentasService(conn).registrar_venta(
            [
                VentaItem(sku="VTA-002", cantidad=1),
                VentaItem(sku="VTA-003", cantidad=5),
            ]
        )
    # nada se descontó
    assert ProductoRepository(conn).obtener("VTA-002").stock == 1
    assert ProductoRepository(conn).obtener("VTA-003").stock == 0
    assert VentaRepository(conn).listar() == []


def test_venta_items_duplicados_rechazados(conn):
    ProductosService(conn).registrar(
        {"sku": "VTA-004", "nombre": "Arepa T", "stock": 10, "precio_unitario": 1.0}
    )
    with pytest.raises(exceptions.ValidacionError):
        VentasService(conn).registrar_venta(
            [
                VentaItem(sku="VTA-004", cantidad=1),
                VentaItem(sku="VTA-004", cantidad=1),
            ]
        )


def test_venta_vacia_rechazada(conn):
    with pytest.raises(exceptions.ValidacionError):
        VentasService(conn).registrar_venta([])
