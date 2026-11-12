# Modelo de Datos — ArepaStock

**Documento:** `docs/Modelo_Datos.md`
**Producto:** ArepaStock (`arepastock`)

## 1. Entidades

### 1.1 Producto
| Atributo | Tipo | Descripción |
|---|---|---|
| id | INTEGER | Identificador interno |
| sku | TEXT | SKU único (ej. ARE-QUE-001) |
| nombre | TEXT | Nombre del producto |
| descripcion | TEXT | Descripción |
| stock | INTEGER | Stock disponible |
| precio_unitario | REAL | Precio de venta unitario |

### 1.2 Movimiento
| Atributo | Tipo | Descripción |
|---|---|---|
| id | INTEGER | Identificador interno |
| fecha_utc | TEXT | Fecha del movimiento |
| tipo | TEXT | entrada / salida / ajuste |
| sku | TEXT | Producto afectado |
| cantidad | INTEGER | Cantidad movida |
| stock_anterior | INTEGER | Stock previo |
| stock_resultante | INTEGER | Stock resultante |
| motivo | TEXT | Motivo del movimiento |
| referencia | TEXT | Referencia (p.ej. venta) |
| venta_id | INTEGER | Venta asociada |

### 1.3 Venta
| Atributo | Tipo | Descripción |
|---|---|---|
| id | INTEGER | Identificador interno |
| fecha_utc | TEXT | Fecha de la venta |
| estado | TEXT | completada / cancelada |
| total | REAL | Total de la venta |

### 1.4 VentaItem
| Atributo | Tipo | Descripción |
|---|---|---|
| id | INTEGER | Identificador interno |
| venta_id | INTEGER | Venta propietaria |
| sku | TEXT | Producto vendido |
| cantidad | INTEGER | Cantidad vendida |
| precio_unitario | REAL | Precio unitario |
| subtotal | REAL | Subtotal |

## 2. DDL SQLite (WAL y migraciones versionadas)

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_version (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    version INTEGER NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    precio_unitario REAL NOT NULL CHECK (precio_unitario >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_utc TEXT NOT NULL DEFAULT (datetime('now')),
    estado TEXT NOT NULL DEFAULT 'completada' CHECK (estado IN ('completada','cancelada')),
    total REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS venta_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    sku TEXT NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (sku) REFERENCES productos(sku)
);

CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_utc TEXT NOT NULL DEFAULT (datetime('now')),
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada','salida','ajuste')),
    sku TEXT NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    stock_anterior INTEGER NOT NULL,
    stock_resultante INTEGER NOT NULL,
    motivo TEXT NOT NULL DEFAULT '',
    referencia TEXT,
    venta_id INTEGER,
    FOREIGN KEY (sku) REFERENCES productos(sku),
    FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_sku_fecha ON movimientos (sku, fecha_utc);
CREATE INDEX IF NOT EXISTS idx_venta_items_venta ON venta_items (venta_id);
```

## 3. Migraciones versionadas
- Tabla `schema_version` con llave única `id = 1` y campo `version`.
- Cada migración se aplica de forma secuencial; versiones futuras se numeran de forma ascendente (p.ej. V2, V3).

## 4. Relaciones
- `movimientos.sku` referencia `productos.sku`.
- `movimientos.venta_id` referencia `ventas.id` (opcional, para salidas vinculadas a ventas).
- `venta_items.venta_id` referencia `ventas.id`.
- `venta_items.sku` referencia `productos.sku`.
