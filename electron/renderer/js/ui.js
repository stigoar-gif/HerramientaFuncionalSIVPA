/* ========================================================================
   ArepaStock — Interfaz de usuario (glassmode, 12 temas, notificaciones)
   ======================================================================== */

let carrito = [];
let vistaActual = 'productos';

// ---------- Utilidades ----------

function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function mostrarToast(mensaje, tipo = 'success') {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: tipo,
    title: mensaje,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: { popup: 'glass swal2-popup a11y-toast' },
  });
}

// ---------- Navegación entre vistas ----------

function mostrarVista(nombre) {
  // Ocultar todas las vistas
  document.querySelectorAll('#content section.view').forEach((el) => {
    el.classList.remove('active');
    el.hidden = true;
  });
  // Desactivar todos los nav-item
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.remove('active');
    el.setAttribute('aria-pressed', 'false');
  });
  // Activar la vista solicitada
  const seccion = document.getElementById('view-' + nombre);
  if (seccion) {
    seccion.classList.add('active');
    seccion.hidden = false;
  }
  const btn = document.querySelector('.nav-item[data-view="' + nombre + '"]');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  }

  vistaActual = nombre;

  // Cargar datos según la vista
  if (nombre === 'productos') {
    cargarProductos();
  } else if (nombre === 'movimientos') {
    cargarMovimientos();
  } else if (nombre === 'pos') {
    cargarProductosParaPOS();
  }
}

function inicializarNavegacion() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) mostrarVista(view);
    });
  });
}

// ---------- Productos ----------

async function cargarProductos() {
  try {
    const productos = await apiClient.listarProductos();
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';
    for (const producto of productos) {
      const stockBajo = producto.stock <= 3;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${escapeHtml(producto.sku)}</code></td>
        <td>${escapeHtml(producto.nombre)}</td>
        <td>${escapeHtml(producto.descripcion || '-')}</td>
        <td class="${stockBajo ? 'stock-bajo' : 'stock-ok'}">${producto.stock}</td>
        <td>$${Number(producto.precio_unitario).toFixed(2)}</td>
        <td class="acciones">
          <button class="btn-icon btn-editar" data-sku="${escapeHtml(producto.sku)}" title="Editar producto" aria-label="Editar ${escapeHtml(producto.nombre)}">
            <i class="fas fa-pen" aria-hidden="true"></i>
          </button>
          <button class="btn-icon btn-stock" data-sku="${escapeHtml(producto.sku)}" title="Ajustar stock" aria-label="Ajustar stock de ${escapeHtml(producto.nombre)}">
            <i class="fas fa-boxes" aria-hidden="true"></i>
          </button>
          <button class="btn-icon btn-eliminar" data-sku="${escapeHtml(producto.sku)}" title="Eliminar producto" aria-label="Eliminar ${escapeHtml(producto.nombre)}">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Eventos de los botones de acción
    tbody.querySelectorAll('.btn-editar').forEach((btn) => {
      btn.addEventListener('click', () => editarProducto(btn.dataset.sku));
    });
    tbody.querySelectorAll('.btn-stock').forEach((btn) => {
      btn.addEventListener('click', () => ajustarStock(btn.dataset.sku));
    });
    tbody.querySelectorAll('.btn-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => eliminarProducto(btn.dataset.sku));
    });
  } catch (error) {
    console.error(error);
    Notifications.add('error', 'No se pudieron cargar los productos desde el backend.', 'Error de productos');
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los productos', customClass: { popup: 'glass swal2-popup' } });
  }
}

async function crearProducto() {
  const { value: form } = await Swal.fire({
    title: 'Nuevo producto',
    html:
      '<input id="swal-sku" class="swal2-input" placeholder="SKU (ej. ARE-QUE-001)">'+
      '<input id="swal-nombre" class="swal2-input" placeholder="Nombre del producto">'+
      '<input id="swal-desc" class="swal2-input" placeholder="Descripción">'+
      '<input id="swal-stock" class="swal2-input" type="number" min="0" placeholder="Stock inicial">'+
      '<input id="swal-precio" class="swal2-input" type="number" min="0" step="0.01" placeholder="Precio unitario">',
    focusConfirm: false,
    customClass: { popup: 'glass swal2-popup' },
    preConfirm: () => ({
      sku: document.getElementById('swal-sku').value,
      nombre: document.getElementById('swal-nombre').value,
      descripcion: document.getElementById('swal-desc').value,
      stock: parseInt(document.getElementById('swal-stock').value) || 0,
      precio_unitario: parseFloat(document.getElementById('swal-precio').value) || 0,
    }),
  });
  if (!form) return;
  if (!form.sku || !form.nombre) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'SKU y nombre son obligatorios', customClass: { popup: 'glass swal2-popup' } });
    return;
  }
  try {
    await apiClient.crearProducto(form);
    Notifications.add('success', `Producto "${form.nombre}" creado correctamente.`, 'Producto creado');
    mostrarToast('Producto creado');
    cargarProductos();
  } catch (error) {
    Notifications.add('error', error.message || 'No se pudo crear el producto', 'Error al crear');
    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear el producto', customClass: { popup: 'glass swal2-popup' } });
  }
}

async function editarProducto(sku) {
  try {
    const productos = await apiClient.listarProductos();
    const p = productos.find((x) => x.sku === sku);
    if (!p) return;
    const { value: form } = await Swal.fire({
      title: 'Editar producto',
      html:
        '<input id="swal-nombre" class="swal2-input" value="'+escapeHtml(p.nombre)+'" placeholder="Nombre">'+
        '<input id="swal-desc" class="swal2-input" value="'+escapeHtml(p.descripcion||'')+'" placeholder="Descripción">'+
        '<input id="swal-stock" class="swal2-input" type="number" min="0" value="'+p.stock+'" placeholder="Stock">'+
        '<input id="swal-precio" class="swal2-input" type="number" min="0" step="0.01" value="'+p.precio_unitario+'" placeholder="Precio">',
      focusConfirm: false,
      customClass: { popup: 'glass swal2-popup' },
      preConfirm: () => ({
        nombre: document.getElementById('swal-nombre').value,
        descripcion: document.getElementById('swal-desc').value,
        stock: parseInt(document.getElementById('swal-stock').value) || 0,
        precio_unitario: parseFloat(document.getElementById('swal-precio').value) || 0,
      }),
    });
    if (!form) return;
    await apiClient.actualizarProducto(sku, form);
    Notifications.add('success', `Producto "${p.nombre}" actualizado.`, 'Producto actualizado');
    mostrarToast('Producto actualizado');
    cargarProductos();
  } catch (error) {
    Notifications.add('error', error.message || 'No se pudo actualizar', 'Error al editar');
    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar', customClass: { popup: 'glass swal2-popup' } });
  }
}

async function ajustarStock(sku) {
  try {
    const productos = await apiClient.listarProductos();
    const p = productos.find((x) => x.sku === sku);
    if (!p) return;
    const { value: form } = await Swal.fire({
      title: 'Ajustar stock — ' + escapeHtml(p.nombre),
      html:
        '<select id="swal-tipo" class="swal2-select">'+
        '<option value="entrada">Entrada (sumar)</option>'+
        '<option value="salida">Salida (restar)</option>'+
        '<option value="ajuste">Ajuste (absoluto)</option>'+
        '</select>'+
        '<input id="swal-cantidad" class="swal2-input" type="number" min="1" placeholder="Cantidad">'+
        '<input id="swal-motivo" class="swal2-input" placeholder="Motivo">'+
        '<input id="swal-ref" class="swal2-input" placeholder="Referencia (opcional)">',
      focusConfirm: false,
      customClass: { popup: 'glass swal2-popup' },
      preConfirm: () => ({
        tipo: document.getElementById('swal-tipo').value,
        cantidad: parseInt(document.getElementById('swal-cantidad').value) || 0,
        motivo: document.getElementById('swal-motivo').value || '',
        referencia: document.getElementById('swal-ref').value || '',
      }),
    });
    if (!form) return;
    if (form.cantidad <= 0) {
      Swal.fire({ icon: 'warning', title: 'Cantidad inválida', text: 'La cantidad debe ser mayor que cero', customClass: { popup: 'glass swal2-popup' } });
      return;
    }
    form.sku = sku;
    await apiClient.crearMovimiento(form);
    Notifications.add('stock', `Movimiento de ${form.tipo} de ${form.cantidad} unidad(es) para "${p.nombre}".`, 'Ajuste de stock');
    mostrarToast('Movimiento registrado');
    cargarProductos();
  } catch (error) {
    Notifications.add('error', error.message || 'No se pudo registrar el movimiento', 'Error de stock');
    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo registrar el movimiento', customClass: { popup: 'glass swal2-popup' } });
  }
}

async function eliminarProducto(sku) {
  const confirmado = await Swal.fire({
    title: '¿Eliminar producto?',
    text: 'Esta acción no se puede deshacer desde la UI. Use la API directamente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    customClass: { popup: 'glass swal2-popup' },
  });
  if (!confirmado.isConfirmed) return;
  Notifications.add('info', 'Eliminar productos requiere usar el endpoint DELETE de la API REST.', 'Información');
}

// ---------- Movimientos ----------

async function cargarMovimientos() {
  try {
    const movimientos = await apiClient.listarMovimientos();
    const tbody = document.getElementById('movements-tbody');
    tbody.innerHTML = '';
    for (const m of movimientos) {
      const tr = document.createElement('tr');
      const tipoClase = m.tipo === 'entrada' ? 'stock-ok' : m.tipo === 'salida' ? 'stock-bajo' : '';
      tr.innerHTML = `
        <td>${escapeHtml(m.fecha_utc)}</td>
        <td class="${tipoClase}"><strong>${escapeHtml(m.tipo)}</strong></td>
        <td><code>${escapeHtml(m.sku)}</code></td>
        <td>${m.cantidad}</td>
        <td>${m.stock_anterior}</td>
        <td>${m.stock_resultante}</td>
        <td>${escapeHtml(m.motivo || '-')}</td>
        <td>${escapeHtml(m.referencia || '-')}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (error) {
    console.error(error);
    Notifications.add('error', 'No se pudieron cargar los movimientos.', 'Error de movimientos');
  }
}

// ---------- Punto de Venta ----------

async function cargarProductosParaPOS() {
  try {
    const productos = await apiClient.listarProductos();
    const contenedor = document.getElementById('pos-products');
    contenedor.innerHTML = '';
    for (const producto of productos) {
      const disabled = producto.stock <= 0 ? 'disabled' : '';
      const card = document.createElement('article');
      card.className = 'pos-product-card glass';
      card.innerHTML = `
        <i class="fas fa-cookie-bite" aria-hidden="true"></i>
        <strong>${escapeHtml(producto.nombre)}</strong>
        <div class="stock">${escapeHtml(producto.sku)} · stock ${producto.stock}</div>
        <div class="precio">$${Number(producto.precio_unitario).toFixed(2)}</div>
        <button type="button" class="btn btn-primary btn-add glass" ${disabled}>
          <i class="fas fa-plus" aria-hidden="true"></i>
          <span>Agregar</span>
        </button>
      `;
      card.querySelector('.btn-add').addEventListener('click', () => {
        if (producto.stock <= 0) return;
        agregarAlCarrito(producto);
      });
      contenedor.appendChild(card);
    }
  } catch (error) {
    console.error(error);
    Notifications.add('error', 'No se pudieron cargar los productos para el POS.', 'Error de POS');
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los productos para el POS', customClass: { popup: 'glass swal2-popup' } });
  }
}

function agregarAlCarrito(producto) {
  const existente = carrito.find((item) => item.sku === producto.sku);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      sku: producto.sku,
      nombre: producto.nombre,
      cantidad: 1,
      precio_unitario: Number(producto.precio_unitario),
    });
  }
  renderizarCarrito();
  Notifications.add('info', `${producto.nombre} agregado al carrito.`, 'Carrito');
  mostrarToast(producto.nombre + ' agregado al carrito', 'info');
}

function removerDelCarrito(index) {
  const removido = carrito[index];
  carrito.splice(index, 1);
  renderizarCarrito();
  if (removido) {
    Notifications.add('info', `${removido.nombre} removido del carrito.`, 'Carrito');
  }
}

function renderizarCarrito() {
  const lista = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const btnVenta = document.getElementById('btn-register-sale');
  lista.innerHTML = '';
  let total = 0;
  carrito.forEach((item, index) => {
    const subtotal = item.cantidad * item.precio_unitario;
    total += subtotal;
    const li = document.createElement('li');
    li.className = 'cart-item glass';
    li.innerHTML = `
      ${escapeHtml(item.sku)} · ${escapeHtml(item.nombre)} × ${item.cantidad}
      <span style="float:right">$${subtotal.toFixed(2)}
      <button type="button" class="btn-eliminar-carrito" data-index="${index}" style="background:none;border:none;color:var(--color-danger);cursor:pointer;margin-left:0.5rem" aria-label="Remover ${escapeHtml(item.nombre)} del carrito">×</button></span>
    `;
    li.querySelector('.btn-eliminar-carrito').addEventListener('click', (e) => {
      removerDelCarrito(Number(e.currentTarget.dataset.index));
    });
    lista.appendChild(li);
  });
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
  btnVenta.disabled = carrito.length === 0;
}

async function registrarVenta() {
  if (carrito.length === 0) return;
  const items = carrito.map((item) => ({
    sku: item.sku,
    cantidad: item.cantidad,
  }));
  try {
    const venta = await apiClient.registrarVenta({ items: items });
    await Swal.fire({
      icon: 'success',
      title: 'Venta registrada',
      text: `Total $${venta.total.toFixed(2)}. Stock actualizado y movimiento trazado.`,
      confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--color-success'),
      customClass: { popup: 'glass swal2-popup' },
    });
    Notifications.add('venta', `Venta registrada por $${venta.total.toFixed(2)} con ${venta.items.length} ítem(es).`, 'Venta exitosa');
    carrito = [];
    renderizarCarrito();
    mostrarVista('movimientos'); // Ir a movimientos para ver trazabilidad
  } catch (error) {
    Notifications.add('error', error.message || 'Operación fallida', 'Error al registrar venta');
    await Swal.fire({
      icon: 'error',
      title: 'Error al registrar la venta',
      text: error.message || 'Operación fallida',
      confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--color-danger'),
      customClass: { popup: 'glass swal2-popup' },
    });
  }
}

// ---------- Inicialización ----------

document.addEventListener('DOMContentLoaded', () => {
  // Navegación
  inicializarNavegacion();

  // Botones POS
  const btnVenta = document.getElementById('btn-register-sale');
  const btnClear = document.getElementById('btn-clear-cart');
  if (btnVenta) btnVenta.addEventListener('click', registrarVenta);
  if (btnClear) btnClear.addEventListener('click', () => {
    carrito = [];
    renderizarCarrito();
    Notifications.add('info', 'Carrito limpiado.', 'Carrito');
  });

  // Botón crear producto
  const btnCrear = document.getElementById('btn-crear-producto');
  if (btnCrear) btnCrear.addEventListener('click', crearProducto);

  // Cerrar dropdowns con tecla Esc (Dropdown ya lo maneja, pero reforzamos globalmente)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Dropdown.close('notificaciones');
      Dropdown.close('accesibilidad');
    }
  });

  // Mostrar vista inicial
  mostrarVista('productos');
});

window.__arepastockUi = { cargarProductos, mostrarVista, agregarAlCarrito };
