# Checklist de Verificación de Requisitos — ArepaStock

**Documento:** `docs/Verificacion_Checklist.md`
**Producto:** ArepaStock (`arepastock`)

Estado: `P` = pendiente, `V` = verificado por prueba/inspección.

## 1. Requisitos Funcionales (RF)

| ID | Requisito | CV | Módulo / Fase | Estado | Evidencia |
|----|-----------|----|---------------|--------|-----------|
| RF-01 | Registrar producto con SKU único, nombre, descripción, stock y precio | CV-01 | `core/services/productos.py`, `core/repositories/productos.py` (FASE 2) | V | `tests/test_arepastock.py::test_producto_crear_y_listar` |
| RF-02 | Catálogo inicial con los 5 SKUs definidos | CV-02 | `core/database/schema.sql` (FASE 2) | V | `tests/test_arepastock.py::test_producto_crear_y_listar` |
| RF-03 | Actualizar precio y stock de producto existente | CV-03 | `core/services/productos.py` (FASE 2) | V | `tests/test_arepastock.py::test_actualizar_producto` |
| RF-04 | Registrar movimiento entrada/salida/ajuste con cantidad, motivo y referencia | CV-04 | `core/services/inventario.py`, `core/repositories/inventario.py` (FASE 2) | V | `tests/test_arepastock.py::test_movimiento_con_trazabilidad` |
| RF-05 | Historial de movimientos con fecha, tipo, producto, cantidad, stocks, motivo y referencia | CV-05 | `core/repositories/inventario.py` (FASE 2) | V | `tests/test_arepastock.py::test_movimiento_con_trazabilidad` |
| RF-06 | Venta con ítems, decremento de stock, transacción atómica (todo o nada) | CV-06 | `core/services/ventas.py`, `core/repositories/ventas.py` (FASE 2) | V | `tests/test_arepastock.py::test_venta_decrementa_stock_atomico` |
| RF-07 | Historial de ventas con ítems y totales | CV-07 | `core/services/ventas.py` (FASE 2) | V | `tests/test_arepastock.py::test_venta_decrementa_stock_atomico` |
| RF-08 | API REST local JSON en `127.0.0.1:<puerto>/api/` | CV-08 | `core/app.py`, `core/api/*.py` (FASE 2) | V | `tests/test_arepastock.py::test_api_endpoints_local` |
| RF-09 | Estructura semántica `header`/`footer`/`sidebar`/`content` | CV-09 | `electron/renderer/index.html` (FASE 3) | P | inspección de código |
| RF-10 | Cinco temas de color + SweetAlert2 + Font Awesome | CV-10 | `electron/renderer/css/themes.css` (FASE 3) | P | inspección de código |
| RF-11 | Información crítica con icono + texto + patrón/forma (no solo color) | CV-11 | `electron/renderer/css/themes.css`, `index.html` (FASE 3) | P | inspección de código |
| RF-12 | Persistencia SQLite con WAL y migraciones versionadas | CV-12 | `core/database/connection.py`, `core/database/schema.sql` (FASE 2) | V | `tests/test_arepastock.py` (usa `init_db`) |

## 2. Requisitos No Funcionales (RNF)

| ID | Requisito | CV | Módulo / Fase | Estado | Evidencia |
|----|-----------|----|---------------|--------|-----------|
| RNF-01 | Rendimiento (< 500 ms operaciones; API < 3 s) | CV-13 | `core/services/*`, pruebas de carga (FASE 2/4) | P | no ejecutado aún |
| RNF-02 | Fiabilidad: operaciones de venta atómicas (ACID) | CV-14 | `core/services/ventas.py` (FASE 2) | V | `test_venta_stock_insuficiente_todo_o_nada` |
| RNF-03 | Seguridad: API escucha solo en `127.0.0.1` | CV-15 | `core/app.py`, `electron/main.js` (FASE 2/3) | P | inspección de código |
| RNF-04 | Usabilidad: operación de un solo usuario sin login ni sesiones | CV-16 | `electron/renderer/*` (FASE 3) | P | inspección de código |
| RNF-05 | Accesibilidad: 5 temas + 4 ajustes de daltonismo | CV-17 | `electron/renderer/css/themes.css`, `js/a11y.js` (FASE 3) | P | `docs/Accesibilidad_Verificacion.md` |
| RNF-06 | Mantenibilidad: separación núcleo/presentación | CV-18 | `core/` vs `electron/` (FASE 1) | P | inspección de arquitectura |
| RNF-07 | Portabilidad: Windows, macOS, Linux | CV-19 | `package.json`, `requirements.txt` (FASE 2/3) | P | inspección de código |
| RNF-08 | Restricciones tecnológicas (Python 3.10+, Electron, SQLite WAL, FA, SA2, REST JSON loopback) | CV-20 | todo el proyecto | P | inspección de código |

## 3. Criterios de aceptación globales

| # | Criterio | Estado | Verificación |
|---|----------|--------|--------------|
| AG-1 | El núcleo Python ejecuta sin Electron y su API es consumible | V | `tests/test_arepastock.py::test_api_endpoints_local` |
| AG-2 | Operaciones de venta y movimiento transaccionales (todo o nada) | V | `test_venta_stock_insuficiente_todo_o_nada` |
| AG-3 | Cada movimiento de stock queda registrado con trazabilidad | V | `test_movimiento_con_trazabilidad` |
| AG-4 | La UI funciona en los 5 temas y 4 ajustes de daltonismo sin pérdida de información | P | `docs/Accesibilidad_Verificacion.md` |
| AG-5 | La SRS cubre todos los requisitos con numeración y CV | V | `docs/SRS_IEEE830.md` |
| AG-6 | Código modularizado, con docstrings y lógica documentada | P | inspección de código |
