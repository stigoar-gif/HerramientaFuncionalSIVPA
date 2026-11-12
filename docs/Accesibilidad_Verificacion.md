# Verificación de Accesibilidad (Daltonismo) — ArepaStock

**Documento:** `docs/Accesibilidad_Verificacion.md`
**Producto:** ArepaStock (`arepastock`)
**Referencia de accesibilidad:** WCAG 2.1 (nivel AA como guía de contraste y no dependencia del color)

## 1. Ajustes de daltonismo implementados

Se prevén cuatro ajustes seleccionables desde el panel de accesibilidad (`electron/renderer/js/a11y.js`) y aplicados mediante el atributo `data-daltonism` sobre `<body>`, que sobrescribe las variables de color del tema activo:

| Ajuste | Valor de `data-daltonism` | Efecto principal |
|--------|---------------------------|------------------|
| General | `general` | Contraste reforzado, enlaces identificables |
| Deuteranopía | `deuteranopia` | Rojo y verde diferenciados mediante matiz alternativo |
| Protanopía | `protanopia` | Rojo percibido como oscuro; uso de azul/magenta |
| Tritanopía | `tritanopia` | Azul y amarillo diferenciados mediante matiz alternativo |

## 2. Requisito de no dependencia del color (RF-11)

Toda información crítica debe comunicarse mediante **icono + texto + patrón/forma**, nunca solo mediante color:

| Situación | Icono | Texto | Patrón/forma |
|-----------|-------|-------|--------------|
| Stock bajo | `⚠` (signo de alerta) | etiqueta de stock bajo | borde/viso de atención en la celda |
| Stock correcto | `✓` | stock disponible | celda normal |
| Venta exitosa | SweetAlert2 `icon: "success"` | mensaje de texto | botón de confirmación |
| Error / venta fallida | SweetAlert2 `icon: "error"` | mensaje de texto | botón de confirmación |

## 3. Método de verificación de daltonismo

Se recomienda verificar cada uno de los cinco temas (claro, oscuro, alto contraste, cálido, frío) combinado con cada uno de los cuatro ajustes de daltonismo, usando al menos una de las siguientes herramientas:

1. **Simulador de daltonismo del navegador** (p. ej. extensión "Colorblindly" o "Stark") aplicando los filtros de deuteranopía, protanopía y tritanopia sobre la UI renderizada.
2. **Coblis / Daltonize** para capturar capturas de pantalla de cada vista y comprobar que los estados (stock bajo, error, éxito) siguen diferenciándose por icono y texto.
3. **Colour Contrast Analyser (CCA)** para medir contraste mínimo 4.5:1 (texto normal) y 3:1 (texto grande / componentes de UI) en cada tema.
4. **Inspector de CSS** confirmando que `document.body.dataset.theme` y `document.body.dataset.daltonism` cambian correctamente al interactuar con el panel de accesibilidad.

## 4. Checklist de verificación de accesibilidad

| Escenario | Tema claro | Tema oscuro | Alto contraste | Tema cálido | Tema frío | Observación |
|-----------|------------|-------------|----------------|-------------|-----------|-------------|
| Stock bajo se identifica sin color | P | P | P | P | P | icono ⚠ + texto |
| Stock correcto se identifica sin color | P | P | P | P | P | icono ✓ + texto |
| Venta exitosa notificada | P | P | P | P | P | SweetAlert2 success |
| Error de venta notificado | P | P | P | P | P | SweetAlert2 error |
| Panel de accesibilidad funcional | P | P | P | P | P | cambia tema y ajuste |
| Contraste mínimo cumplido (CCA) | P | P | P | P | P | por verificar con herramienta |

`P` = pendiente de ejecución manual con las herramientas indicadas.

## 5. Notas

- Los ajustes de daltonismo sobrescriben **solo variables de color**; la estructura, tipografía, iconos y textos no se modifican, por lo que no hay pérdida de información al cambiar de tema o de ajuste.
- La aplicación no depende de internet; la verificación se realiza localmente sobre el archivo `electron/renderer/index.html` una vez instaladas las dependencias de `package.json` (Font Awesome y SweetAlert2 locales).
