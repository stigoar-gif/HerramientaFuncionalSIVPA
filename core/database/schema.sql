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
    imagen TEXT,
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

CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK (tipo IN ('stock_bajo','venta','error','info')),
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leida INTEGER NOT NULL DEFAULT 0 CHECK (leida IN (0,1)),
    creada_en TEXT NOT NULL DEFAULT (datetime('now')),
    referencia TEXT
);

CREATE INDEX IF NOT EXISTS idx_movimientos_sku_fecha ON movimientos (sku, fecha_utc);
CREATE INDEX IF NOT EXISTS idx_venta_items_venta ON venta_items (venta_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_creada_en ON notificaciones (creada_en DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones (leida);

INSERT OR IGNORE INTO productos (sku, nombre, descripcion, stock, precio_unitario, imagen) VALUES
    ('ARE-QUE-001', 'Arepa rellena de queso', 'Arepa rellena con queso', 0, 3.50, 'images/productos/are-que-001.svg'),
    ('ARE-ALI-002', 'Arepa aliñada', 'Arepa aliñada', 0, 2.50, 'images/productos/are-ali-002.svg'),
    ('ARE-MOT-003', 'Arepa de mote', 'Arepa de mote', 0, 3.00, 'images/productos/are-mot-003.svg'),
    ('TOR-MOT-004', 'Tortillas de maíz de mote', 'Tortilla de maíz de mote', 0, 1.20, 'images/productos/tor-mot-004.svg'),
    ('ARE-TRA-005', 'Arepa tradicional de maíz trillado', 'Arepa tradicional', 0, 2.80, 'images/productos/are-tra-005.svg');
