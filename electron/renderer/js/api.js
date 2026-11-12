/* ArepaStock — cliente de la API REST local */

const ApiClient = {
  listarProductos: () => window.api.productos.listar(),
  crearProducto: (data) => window.api.productos.crear(data),
  actualizarProducto: (sku, data) => window.api.productos.actualizar(sku, data),

  listarMovimientos: () => window.api.inventario.listar(),
  crearMovimiento: (data) => window.api.inventario.registrar(data),

  listarVentas: () => window.api.ventas.listar(),
  registrarVenta: (data) => window.api.ventas.registrar(data),
};

window.apiClient = ApiClient;
