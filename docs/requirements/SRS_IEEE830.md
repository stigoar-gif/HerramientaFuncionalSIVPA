# Especificacion de Requisitos de Software (IEEE 830)

**Documento:** SRS-AREP-001
**Producto:** ArepaPOS
**Version:** 1.0
**Fecha:** 2026-11-05
**Estado:** Borrador para revision

---

## 1. Introduccion

### 1.1 Proposito
El presente documento especifica los requisitos de software para ArepaPOS, aplicacion de escritorio que integra un modulo de inventario y un modulo de punto de venta (POS) para una fabrica de arepas.

### 1.2 Alcance
El sistema esta dirigido a un usuario unico (operador de fabrica) sin autenticacion ni gestion de sesiones.

### 1.3 Definiciones
- POS: Punto de Venta.
- Stock: Cantidad disponible de un producto.

## 2. Requisitos

### 2.1 Requisitos funcionales

| ID | Prioridad | Requisito | Criterio de aceptacion |
|----|-----------|----------|------------------------|
| FR-001 | Must | El sistema SHALL registrar productos del catalogo con SKU, nombre, precio de venta, costo, stock inicial y unidad. | Registro valido de los 5 productos definidos. |
| FR-002 | Must | El sistema SHALL permitir consultar el catalogo con stock disponible. | Respuesta de consulta incluye stock actual y activos. |
| FR-003 | Must | El sistema SHALL registrar movimientos de entrada de stock con cantidad y observaciones. | Se crea movimiento con tipo IN, stock antes y despues correctos. |
| FR-004 | Must | El sistema SHALL registrar movimientos de salida validando disponibilidad de stock. | No se permite salida con stock insuficiente. |
| FR-005 | Must | El sistema SHALL registrar ventas con items, cantidades, precio unitario, metodo de pago y descuento, debiendo descontar stock. | Cada venta genera movimientos OUT y queda persistida. |
| FR-006 | Must | El sistema SHALL generar comprobantes con numero unico correlativo. | Numero de formato serie-consecutivo, unico en persistencia. |
| FR-007 | Must | El sistema SHALL consultar historial de movimientos con fecha, tipo, producto, cantidad, usuario y referencia. | Listado incluye campos requeridos. |
| FR-008 | Must | El sistema SHALL persistir en SQLite con migraciones versionadas y transacciones ACID. | Operaciones atomicas; rollback ante fallo. |
| FR-009 | Must | El nucleo Python SHALL exponer API local (HTTP JSON) independiente de Electron. | python -m arepas_core serve funciona sin Electron. |
| FR-010 | Must | La interfaz SHALL estructurarse semanticamente con header, footer, sidebar y content. | Estructura DOM validada. |
| FR-011 | Must | La interfaz SHALL usar Font Awesome para iconografia y SweetAlert para dialogos. | Presencia de librerias y uso en flujos. |
| FR-012 | Must | La interfaz SHALL ofrecer cinco temas de color, incluidos modo oscuro y alto contraste. | Aplicacion de data-theme con 5 temas. |
| FR-013 | Must | La interfaz SHALL ofrecer modos de accesibilidad perceptual para daltonismo. | Verificacion de contraste y patrones redundantes. |
| FR-014 | Should | El sistema SHALL ofrecer consultas de ventas y estadisticas basicas. | Verificacion: /api/stats. |

### 2.2 Requisitos no funcionales

| ID | Categoria | Requisito | Criterio de aceptacion |
|----|-----------|----------|------------------------|
| NFR-001 | Rendimiento | Las operaciones de venta SHALL completarse en <= 500 ms. | Medicion con pruebas de aceptacion. |
| NFR-002 | Consistencia | Las transacciones SHALL ser ACID (SQLite). | Prueba de rollback en venta con producto invalido. |
| NFR-003 | Usabilidad | El flujo POS SHALL permitir completar venta con <= 3 clics desde la seleccion. | Prueba de usabilidad basica. |
| NFR-004 | Accesibilidad | Contraste >= 4.5:1 para texto normal; foco visible; area tactil >= 44 px. | Verificacion con WCAG 2.1. |
| NFR-005 | Portabilidad | La aplicacion SHALL ejecutarse en Windows, macOS y Linux con Python 3.10+. | Pruebas de instalacion. |
| NFR-006 | Seguridad | La API SHALL restringirse a loopback (127.0.0.1). | Verificacion de bind address. |
| NFR-007 | Confiabilidad | El sistema SHALL evitar stock negativo y SHALL registrar auditoria. | Tests de integridad. |
| NFR-008 | Mantenibilidad | La logica SHALL estar separada de la presentacion. | Revision de codigo. |
| NFR-009 | Privacidad | El sistema SHALL no incluir telemetria. | Verificacion de codigo. |

---

## 3. Trazabilidad

| Requisito | Modulo responsable |
|-----------|--------------------|
| FR-001 - FR-008 | src/arepas_core, migrations |
| FR-009 | src/arepas_core/api, src/arepas_core/__main__ |
| FR-010 - FR-014 | ui, electron |
| NFR-001 - NFR-009 | tests, src/arepas_core |

---

## 4. Criterios de verificacion e historial de cambios

### 4.1 Criterios de verificacion
Cada requisito SHALL contener una prueba de verificacion automatizada, de API, manual de UI o documental.

### 4.2 Historial de cambios
| Version | Fecha | Cambio | Autor |
|---------|-------|--------|-------|
| 1.0 | 2026-11-05 | Version inicial | Ingenieria de software |
