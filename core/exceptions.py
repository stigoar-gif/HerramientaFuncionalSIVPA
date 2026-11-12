"""Excepciones de dominio para ArepaStock."""


class DomainError(Exception):
    """Error base de dominio."""


class ProductoNoEncontradoError(DomainError):
    """El producto indicado no existe en el catálogo."""


class ProductoDuplicadoError(DomainError):
    """Ya existe un producto con el SKU indicado."""


class ValidacionError(DomainError):
    """Los datos de entrada son inválidos."""


class StockInsuficienteError(DomainError):
    """No hay stock suficiente para completar la operación."""


class NotificacionNoEncontradaError(DomainError):
    """La notificación indicada no existe o ya fue leída."""
