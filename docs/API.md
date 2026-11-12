# API REST — Endpoints de Notificaciones

**Producto:** ArepaStock  
**Núcleo:** Python + Flask (API local en `127.0.0.1:<puerto>/api/`)  
**Versión:** 2.0  

---

## Endpoints

### GET /api/notificaciones
Lista todas las notificaciones del sistema, ordenadas por fecha descendente.

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `solo_no_leidas` | string | `"true"` para filtrar solo no leídas; `"false"` (default) para todas. |

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "tipo": "venta",
    "titulo": "Venta registrada",
    "mensaje": "Venta #3 completada por $10.50 con 2 ítem(es).",
    "leida": 0,
    "creada_en": "2026-11-05T15:30:00+00:00",
    "referencia": "3"
  }
]
```

---

### GET /api/notificaciones/contar-no-leidas
Retorna el total de notificaciones sin leer. Útil para mostrar el badge en la UI.

**Respuesta (200):**
```json
{"total": 3}
```

---

### POST /api/notificaciones/{id}/leer
Marca una notificación específica como leída.

**Ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | Identificador de la notificación. |

**Respuesta (200):** objeto de la notificación actualizada.  
**Respuesta (404):** `{"error": "...", "codigo": "NOTIFICACION_NO_ENCONTRADA"}`.

---

### POST /api/notificaciones/leer-todas
Marca todas las notificaciones como leídas.

**Respuesta (200):**
```json
{"actualizadas": 5}
```

---

## Generación automática de notificaciones

El sistema genera notificaciones automáticamente en los siguientes eventos:

| Evento | Tipo | Origen |
|--------|------|--------|
| Stock bajo (<= 3 unidades) | `stock_bajo` | `InventarioService.registrar_movimiento` |
| Venta registrada | `venta` | `VentasService.registrar_venta` |
| Stock insuficiente | `error` | Endpoints `POST /api/inventory/movements` y `POST /api/sales` |

---

## Modelo de datos (SQLite)

Tabla `notificaciones`:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER PK | Identificador interno |
| `tipo` | TEXT | `stock_bajo`, `venta`, `error`, `info` |
| `titulo` | TEXT | Título corto de la notificación |
| `mensaje` | TEXT | Cuerpo del mensaje |
| `leida` | INTEGER (0/1) | Estado de lectura |
| `creada_en` | TEXT | Fecha y hora de creación (ISO 8601) |
| `referencia` | TEXT | Referencia opcional (SKU, id de venta, etc.) |

Índices: `idx_notificaciones_creada_en`, `idx_notificaciones_leida`.
