# ArepaStock

Sistema de inventario y punto de venta (POS) para una fabrica de arepas.
Desarrollado con **Electron** (shell de escritorio) + **Python** (nucleo de logica de negocio y API REST local).

## Catalogo inicial
1. Arepa rellena de queso (ARE-QUE-001)
2. Arepa aliñada (ARE-ALI-002)
3. Arepa de mote (ARE-MOT-003)
4. Tortillas de maíz de mote (TOR-MOT-004)
5. Arepa tradicional de maíz trillado (ARE-TRA-005)

## Arquitectura
- `core/` — Nucleo Python: logica de negocio, servicios, repositorios, modelos, base de datos SQLite (WAL + migraciones) y API REST local (Flask) en `127.0.0.1:8000/api/`. No conoce a Electron; es ejecutable de forma independiente.
- `electron/` — Shell Electron: `main.js`, `preload.js` y renderer (`index.html`, `css/themes.css`, `js/*.js`). Interfaz semantica (`header`, `footer`, `sidebar`, `content`), cinco temas, iconografia Font Awesome, dialogos SweetAlert2 y panel de accesibilidad (daltonismo).
- `docs/` — Especificacion IEEE 830 (SRS), modelo de datos, arquitectura, accesibilidad y checklist de verificacion.
- `tests/` — Pruebas automatizadas del nucleo Python (pytest).

## Ejecucion rapida

### 1. Nucleo Python (API local, independiente de Electron)
```bash
pip install -r requirements.txt
python -m core.app
# API en http://127.0.0.1:8000/api/health
```

### 2. Electron (interfaz de escritorio)
Requiere descarga del binario de Electron (red):
```bash
npm install
npm start
```

La UI consume la API local del nucleo por HTTP. Ambos procesos corren en localhost.

## Pruebas del nucleo
```bash
pip install pytest
python -m pytest tests/ -v
```

## Documentacion obligatoria
- `docs/SRS_IEEE830.md` — Especificacion de Requisitos de Software (IEEE 830-1998) con requisitos funcionales/no funcionales numerados, matriz de trazabilidad y criterios de verificacion.
- `docs/Modelo_Datos.md` — Modelo de datos y DDL SQLite.
- `docs/Arquitectura.md` — Separacion nucleo Python <-> Electron.
- `docs/Accesibilidad_Verificacion.md` — Temas y verificacion de daltonismo.
- `docs/Verificacion_Checklist.md` — Criterios de aceptacion.

## Criterios de aceptacion
- El nucleo Python ejecuta sin Electron y su API es consumible.
- Operaciones de inventario y venta son transaccionales y consistentes.
- Cada movimiento de stock queda registrado con trazabilidad (fecha, tipo, producto, cantidad, usuario implícito del sistema).
- La UI funciona en los 5 temas y respeta los ajustes de accesibilidad para daltonismo.
- La SRS IEEE 830 cubre todos los requisitos con numeracion y criterios de verificacion.
