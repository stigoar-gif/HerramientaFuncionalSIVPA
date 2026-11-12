# Estructura del Proyecto — ArepaStock

**Documento:** `docs/Estructura_Proyecto.md`
**Producto:** ArepaStock (`arepastock`)

```text
arepastock/
├── docs/                          # Documentación técnica y de especificaciones
│   ├── SRS_IEEE830.md             # Especificación de Requisitos de Software (IEEE 830-1998)
│   ├── Estructura_Proyecto.md    # Este documento (estructura del proyecto)
│   ├── Arquitectura.md           # Separación núcleo Python <-> Electron
│   └── Modelo_Datos.md           # Modelo de datos y DDL SQLite
│
├── core/                          # NÚCLEO PYTHON (lógica de negocio + API REST local)
│   ├── app.py                     # Punto de entrada: API REST en 127.0.0.1:<puerto>/api/
│   ├── models/                    # Producto, Movimiento, Venta, VentaItem
│   ├── repositories/              # Acceso a datos (SQLite)
│   ├── services/                  # Productos, Inventario, Ventas
│   └── database/                  # Conexión SQLite + migraciones versionadas
│
├── electron/                      # SHELL ELECTRON (interfaz de escritorio)
│   ├── main.js                    # Creación de ventana y handlers IPC
│   ├── preload.js                 # Bridge seguro hacia la API del núcleo
│   └── renderer/
│       ├── index.html            # Estructura semántica header/footer/sidebar/content
│       ├── css/
│       │   └── themes.css        # Cinco temas + ajustes de daltonismo
│       └── js/
│           ├── api.js            # Consumo de la API REST local
│           ├── ui.js             # Render de la interfaz
│           └── a11y.js           # Panel de accesibilidad (daltonismo)
│
├── tests/                         # Pruebas del núcleo Python (pytest)
├── requirements.txt               # Dependencias del núcleo Python
└── README.md
```

**Notas del árbol:**
- `docs/`: artefactos de documentación de la Fase 1.
- `core/`: única fuente de verdad de reglas de negocio; no conoce a Electron.
- `electron/`: solo manejo de ventana, IPC y consumo de la API REST.
- `tests/`: pruebas automatizadas del núcleo.
