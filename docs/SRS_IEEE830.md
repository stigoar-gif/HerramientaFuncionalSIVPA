# Especificación de Requisitos de Software (SRS)

**Producto:** ArepaStock
**Nombre técnico:** `arepastock`
**Estándar:** IEEE 830-1998
**Documento:** `docs/SRS_IEEE830.md`
**Versión:** 1.0

---

## 1. Introducción

### 1.1 Propósito
El presente documento constituye la Especificación de Requisitos de Software (SRS) del producto de software **ArepaStock**, desarrollado para una fábrica de arepas. El propósito de este documento es especificar los requisitos funcionales y no funcionales que la aplicación de escritorio deberá satisfacer, de forma completa, unívoca y trazable, a fin de guiar el diseño, la implementación, las pruebas y la validación del sistema.

### 1.2 Alcance
El alcance del producto comprende las siguientes capacidades:
- Gestión del catálogo de productos, con un catálogo inicial de cinco (5) productos.
- Registro de movimientos de inventario (entrada, salida y ajuste) con trazabilidad.
- Punto de venta (POS) con registro de ventas transaccional.
- Persistencia local en SQLite con modo WAL y migraciones versionadas.
- Exposición de una API HTTP local REST/JSON en `127.0.0.1:<puerto>/api/`.
- Interfaz de escritorio con Electron, con cinco temas de color y ajustes de accesibilidad para daltonismo.
- Notificaciones y diálogos con SweetAlert2; iconografía con Font Awesome.

**Fuera de alcance:** autenticación, gestión de sesiones, multiusuario, facturación electrónica, sincronización remota y operación remota a través de internet.

### 1.3 Definiciones, acrónimos y abreviaturas

| Abreviatura | Definición |
|---|---|
| SRS | Software Requirements Specification |
| RF | Requisito Funcional |
| RNF | Requisito No Funcional |
| CV | Criterio de Verificación |
| SKU | Stock Keeping Unit |
| POS | Point of Sale |
| API | Application Programming Interface |
| JSON | JavaScript Object Notation |
| SQLite | Motor de base de datos embebida |
| WAL | Write-Ahead Logging |
| REST | Representational State Transfer |
| HTTP | Hypertext Transfer Protocol |
| UI | User Interface |
| FA | Font Awesome |
| SA2 | SweetAlert2 |
| DAL | Daltonismo |

### 1.4 Referencias
1. IEEE, *IEEE Recommended Practice for Software Requirements Specifications*, IEEE Std 830-1998.
2. Documentación técnica de arquitectura y diseño de ArepaStock.
3. Documentación de la API REST local del núcleo Python.

### 1.5 Visión general del documento
El documento se estructura en cinco secciones: (1) Introducción, (2) Descripción General, (3) Requisitos Específicos, (4) Matriz de Trazabilidad y Verificación, y (5) Apéndices.

## 2. Descripción General

### 2.1 Perspectiva del producto
ArepaStock se concibe como una aplicación de escritorio de un solo usuario. El producto se descompone en dos procesos que colaboran:

- **Shell Electron (interfaz):** ventana de escritorio que aloja la UI semántica (`header`, `footer`, `sidebar`, `content`), aplica los cinco temas, expone el panel de accesibilidad y se comunica con el núcleo mediante peticiones HTTP a la API local.
- **Núcleo Python (lógica de negocio):** componente independiente que expone los endpoints REST/JSON del catálogo, inventario, movimientos, ventas y estado del sistema; orquesta repositorios, servicios y transacciones.

Diagrama de arquitectura:

```
+----------------------+   HTTP/JSON (REST)   +----------------------+   SQL/WAL   +------------------+
| Electron Shell       | --------------------> | Python Core         | ---------> | SQLite          |
| - main.js             |                      | - app.py             |            | - journal_mode  |
| - preload.js          |                      | - routers            |            | - migraciones   |
| - renderer/           | <-------------------- | - services           |            |                  |
|   index.html          |   JSON responses     | - repositories       |            +------------------+
|   css/, js/           |                      | - models             |
+----------------------+                      +----------------------+
```

### 2.2 Funciones del producto
El producto proporciona como funciones principales: gestión del catálogo de productos, control de inventario y movimientos, punto de venta, persistencia local, API local, interfaz de usuario accesible y notificaciones.

### 2.3 Características de los usuarios
El usuario objetivo es el personal operativo de la fábrica de arepas, responsable de registrar productos, controlar stock y realizar ventas. No se requieren perfiles ni roles de usuario.

### 2.4 Restricciones
- Python 3.10 o superior.
- Electron para la interfaz.
- SQLite con WAL habilitado y migraciones versionadas.
- API local REST/JSON en `127.0.0.1:<puerto>/api/`.
- Sin login, sin sesiones y sin multiusuario.
- Sin dependencia de internet para operar.
- Font Awesome + SweetAlert2.
- Cinco temas de color; cuatro ajustes de daltonismo.
- Aplicación de un solo usuario.

### 2.5 Suposiciones y dependencias
- SQLite instalado localmente.
- Python 3.10 o superior instalado.
- Electron instalado.
- Hardware de escritorio disponible en el punto de venta.

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales

#### 3.1.1 Gestión de productos
- **RF-01**: El sistema SHALL registrar un producto del catálogo con SKU único, nombre, descripción, stock inicial y precio unitario. **CV-01**.
- **RF-02**: El sistema SHALL mantener el catálogo inicial con los SKUs: ARE-QUE-001, ARE-ALI-002, ARE-MOT-003, TOR-MOT-004 y ARE-TRA-005. **CV-02**.
- **RF-03**: El sistema SHALL permitir actualizar el precio unitario y el stock de un producto existente. **CV-03**.

#### 3.1.2 Gestión de inventario y movimientos
- **RF-04**: El sistema SHALL registrar movimientos de inventario de tipo entrada, salida o ajuste, con cantidad, motivo y referencia. **CV-04**.
- **RF-05**: El sistema SHALL conservar el historial de movimientos con fecha, tipo, producto, cantidad, stock anterior, stock resultante, motivo y referencia. **CV-05**.

#### 3.1.3 Punto de venta (POS)
- **RF-06**: El sistema SHALL registrar una venta con uno o más ítems (SKU, cantidad, precio unitario) y decrementar el stock en una transacción atómica. **CV-06**.
- **RF-07**: El sistema SHALL permitir consultar el historial de ventas con sus ítems y totales. **CV-07**.

#### 3.1.4 API HTTP local
- **RF-08**: El sistema SHALL exponer endpoints REST sobre JSON en `127.0.0.1:<puerto>/api/`. **CV-08**.

#### 3.1.5 Interfaz de usuario
- **RF-09**: La interfaz SHALL implementar la estructura semántica `header`, `footer`, `sidebar` y `content`. **CV-09**.
- **RF-10**: La interfaz SHALL ofrecer cinco temas de color y notificaciones mediante SweetAlert2, con iconografía Font Awesome. **CV-10**.
- **RF-11**: La información crítica SHALL presentarse mediante icono + texto + patrón/forma, sin depender únicamente del color. **CV-11**.

#### 3.1.6 Persistencia
- **RF-12**: El sistema SHALL persistir en SQLite con WAL y migraciones versionadas. **CV-12**.

### 3.2 Requisitos No Funcionales

- **RNF-01**: Rendimiento. Las operaciones de inventario y POS SHALL responder en menos de 500 ms; la API SHALL estar disponible en menos de 3 s. **CV-13**.
- **RNF-02**: Fiabilidad. Las operaciones de venta SHALL ejecutarse de forma atómica (ACID). **CV-14**.
- **RNF-03**: Seguridad. La API SHALL escuchar únicamente en `127.0.0.1`. **CV-15**.
- **RNF-04**: Usabilidad. La interfaz SHALL permitir la operación del punto de venta sin requerir procesos complejos de capacitación. **CV-16**.
- **RNF-05**: Accesibilidad. El sistema SHALL soportar cinco temas y cuatro ajustes de daltonismo. **CV-17**.
- **RNF-06**: Mantenibilidad. El sistema SHALL mantener separación entre la capa de lógica de negocio y la capa de presentación. **CV-18**.
- **RNF-07**: Portabilidad. El sistema SHALL ejecutarse en Windows, macOS o Linux. **CV-19**.
- **RNF-08**: Restricciones tecnológicas. El sistema SHALL utilizar Electron, Python 3.10+, SQLite con WAL, migraciones versionadas, Font Awesome, SweetAlert2, REST y JSON. **CV-20**.

### 3.3 Requisitos de Interfaces Externas
- **Interfaz de usuario:** ventana con `header`, `footer`, `sidebar` y `content`; iconos Font Awesome; diálogos SweetAlert2.
- **Hardware:** teclado, ratón, lector de código de barras opcional y pantalla de escritorio.
- **Software:** shell Electron, núcleo Python, SQLite, Font Awesome, SweetAlert2.
- **Comunicación:** HTTP/JSON sobre loopback en `127.0.0.1:<puerto>/api/`.

### 3.4 Requisitos de Datos
| Entidad | Atributos relevantes | Relaciones |
|---|---|---|
| Producto | id, sku, nombre, descripcion, stock, precio_unitario | Uno a muchos con Movimiento y VentaItem |
| Movimiento | id, fecha_utc, tipo, sku, cantidad, stock_anterior, stock_resultante, motivo, referencia, venta_id | Muchos a uno con Producto; opcional con Venta |
| Venta | id, fecha_utc, estado, total | Uno a muchos con VentaItem |
| VentaItem | id, venta_id, sku, cantidad, precio_unitario, subtotal | Muchos a uno con Venta y Producto |

DDL resumido:

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

### 3.5 Requisitos de Accesibilidad y Temas
El sistema SHALL ofrecer cinco temas de color (claro, oscuro, alto contraste, cálido y frío) y cuatro ajustes de daltonismo (deuteranopía, protanopía, tritanopía y daltonismo general).

## 4. Matriz de Trazabilidad y Verificación

### 4.1 Trazabilidad requisito → módulo
| Requisito | Módulo / Fase | Verificación |
|---|---|---|
| RF-01 | core/services/productos_service.py, core/repositories/productos_repo.py (FASE 2) | CV-01 |
| RF-02 | core/catalogo/seed (FASE 2) | CV-02 |
| RF-03 | core/services/productos_service.py (FASE 2) | CV-03 |
| RF-04 | core/services/inventario_service.py (FASE 2) | CV-04 |
| RF-05 | core/services/inventario_service.py (FASE 2) | CV-05 |
| RF-06 | core/services/ventas_service.py (FASE 2) | CV-06 |
| RF-07 | core/services/ventas_service.py (FASE 2) | CV-07 |
| RF-08 | core/api/routers/*.py (FASE 2) | CV-08 |
| RF-09 | electron/renderer/index.html (FASE 3) | CV-09 |
| RF-10 | electron/renderer/css/themes.css, js/ui.js (FASE 3) | CV-10 |
| RF-11 | electron/renderer/js/a11y.js (FASE 3) | CV-11 |
| RF-12 | core/database/ (FASE 2) | CV-12 |
| RNF-01 | core/api, tests (FASE 2/4) | CV-13 |
| RNF-02 | core/services/ventas_service.py (FASE 2) | CV-14 |
| RNF-03 | core/api (FASE 2) | CV-15 |
| RNF-04 | electron/renderer (FASE 3) | CV-16 |
| RNF-05 | electron/renderer/js/a11y.js, css/themes.css (FASE 3) | CV-17 |
| RNF-06 | arquitectura de capas (FASE 1) | CV-18 |
| RNF-07 | empaquetado Electron (FASE 3) | CV-19 |
| RNF-08 | decisiones técnicas (FASE 1) | CV-20 |

### 4.2 Criterios de aceptación globales
- El núcleo Python debe ejecutarse sin Electron y su API debe ser consumible.
- Las operaciones de venta y movimiento deben ser transaccionales (todo o nada).
- Cada movimiento de stock debe quedar registrado con trazabilidad.
- La UI debe funcionar en los cinco temas y los cuatro ajustes de daltonismo sin pérdida de información.
- La SRS debe cubrir todos los requisitos con numeración y criterios de verificación.
- El código debe estar modularizado, con docstrings y sin lógica no obvia sin documentar.

## 5. Apéndices

### 5.1 Estructura del proyecto
Consultar `docs/Estructura_Proyecto.md`.

### 5.2 Catálogo inicial

| SKU | Producto | Stock inicial | Precio unitario |
|---|---|---|---|
| ARE-QUE-001 | Arepa rellena de queso | 0 | 3.50 |
| ARE-ALI-002 | Arepa aliñada | 0 | 2.50 |
| ARE-MOT-003 | Arepa de mote | 0 | 3.00 |
| TOR-MOT-004 | Tortillas de maíz de mote | 0 | 1.20 |
| ARE-TRA-005 | Arepa tradicional de maíz trillado | 0 | 2.80 |

### 5.3 Glosario de verificación
- **CV-xx**: criterio de verificación asociado a cada requisito.
- **FASE x**: fase de entrega aplicable a cada módulo verificado.
