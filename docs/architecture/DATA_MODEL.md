# Modelo de Datos - ArepaPOS

**Documento:** DAT-MODEL-001
**Version:** 1.0

## 1. Introduccion

El nucleo de persistencia del sistema es SQLite (archivo local: data/arepapos.db), con migraciones versionadas y transacciones SQL explicitas.

## 2. Esquema inicial (migracion 001_initial_schema.sql)

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL DEFAULT 'unidad',
    price REAL NOT NULL CHECK (price >= 0),
    cost REAL NOT NULL DEFAULT 0 CHECK (cost >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('IN','OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    reference_id INTEGER,
    notes TEXT,
    user TEXT NOT NULL DEFAULT 'sistema',
    created_at TEXT NOT NULL
);

CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED','CANCELLED')),
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    cashier TEXT NOT NULL DEFAULT 'sistema',
    created_at TEXT NOT NULL
);

CREATE TABLE sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL REFERENCES sales(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL,
    line_total REAL NOT NULL
);

CREATE TABLE schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL
);
```

## 3. Reglas de negocio

- Toda venta se ejecuta dentro de una transaccion ACID que crea sale, sale_items y movimientos OUT.
- Las salidas se validan contra stock disponible.
- Cada movimiento registra stock_before, stock_after y usuario.

