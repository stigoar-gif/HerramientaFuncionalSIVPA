# Arquitectura — ArepaStock

**Documento:** `docs/Arquitectura.md`
**Producto:** ArepaStock (`arepastock`)

## 1. Visión general
ArepaStock se implementa con una arquitectura de dos procesos que colaboran:

1. **Shell Electron (Capa de presentación):** crea la ventana de escritorio, carga el renderer, expone el bridge seguro mediante `preload.js` y actúa como cliente HTTP hacia el núcleo.
2. **Núcleo Python (Capa de negocio):** expone la API REST local JSON en `127.0.0.1:<puerto>/api/`, contiene servicios, repositorios, modelos y transacciones.

## 2. Capas y responsabilidades

### 2.1 Capa de presentación (Electron)
- `electron/main.js`: creación de la ventana `BrowserWindow`.
- `electron/preload.js`: expone únicamente la API bridge al renderer.
- `electron/renderer/index.html`: estructura semántica.
- `electron/renderer/css/themes.css`: cinco temas.
- `electron/renderer/js/api.js`: consumo REST.
- `electron/renderer/js/ui.js`: render.
- `electron/renderer/js/a11y.js`: ajustes de daltonismo.

### 2.2 Capa de aplicación / núcleo Python (`core`)
- `core/app.py`: punto de entrada de la API REST local.
- `core/api/`: routers REST (`products`, `inventory`, `sales`, `health`).
- `core/services/`: lógica de productos, inventario y ventas.
- `core/repositories/`: acceso a SQLite.
- `core/models/`: entidades de dominio.

### 2.3 Capa de datos
- SQLite local con `PRAGMA journal_mode = WAL` y tabla `schema_version` para migraciones versionadas.

## 3. Separación explícita núcleo Python <-> Electron
- Electron **no contiene** lógica de inventario ni de ventas.
- La UI de Electron se comunica exclusivamente con el núcleo mediante HTTP/JSON a `127.0.0.1:<puerto>/api/`.
- El núcleo Python debe poder ejecutarse de forma independiente (por ejemplo, `python -m core.app`) y ser consumido por cualquier cliente REST.
- El shell Electron actúa como cliente HTTP del núcleo; el núcleo actúa como servidor local.

## 4. Flujo de una venta (transaccional)
1. La UI envía la venta a `POST /api/sales`.
2. El servicio de ventas valida stock y aplica decremento dentro de una transacción ACID.
3. Si falla cualquier ítem, se revierte el registro (operación todo o nada).
4. Se registra movimiento de salida asociado y venta con ítems.
5. La UI notifica mediante SweetAlert2 el resultado.

## 5. Diagrama de capas (resumen)

```text
┌──────────────────────┐
│ Electron (renderer)   │  UI semántica, temas, a11y, SweetAlert2, Font Awesome
└──────────┬───────────┘
           │ HTTP/JSON REST
           ▼
┌──────────────────────┐
│ Python Core          │  app.py, routers, services, repositories, models
└──────────┬───────────┘
           │ SQL
           ▼
┌──────────────────────┐
│ SQLite (WAL)          │
└──────────────────────┘
```
