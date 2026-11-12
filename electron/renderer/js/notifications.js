/* ========================================================================
   ArepaStock — Panel de notificaciones (con backend y polling)
   ======================================================================== */

const Notifications = {
  panel: null,
  trigger: null,
  overlay: null,
  container: null,
  badge: null,
  count: 0,
  pollingInterval: null,
  POLL_MS: 30000,
  filtroActual: 'todos', // todos | no-leidas | venta | stock_bajo | error | info

  init() {
    this.panel = document.getElementById('notificaciones-panel');
    this.trigger = document.getElementById('btn-notificaciones');
    this.overlay = document.getElementById('overlay-notificaciones');
    this.container = document.getElementById('lista-notificaciones');
    this.badge = document.getElementById('badge-notificaciones');

    if (!this.panel || !this.trigger) return;

    Dropdown.register('notificaciones', {
      trigger: this.trigger,
      panel: this.panel,
      overlay: this.overlay,
      onOpen: () => {
        this.filtroActual = 'todos';
        this.cargarYRenderizar();
        posicionarDropdown('notificaciones-panel', 'btn-notificaciones', 'overlay-notificaciones');
      },
      onClose: () => {},
    });

    this.cargarContador();
    this.iniciarPolling();
  },

  iniciarPolling() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(() => {
      this.cargarContador();
      if (this.panel && !this.panel.hidden) {
        this.cargarYRenderizar();
      }
    }, this.POLL_MS);
  },

  async cargarContador() {
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/notificaciones/contar-no-leidas');
      if (!resp.ok) return;
      const data = await resp.json();
      const total = data.total || 0;
      this.count = total;
      this.actualizarBadge();
    } catch (e) {
      console.warn('No se pudo contar notificaciones', e);
    }
  },

  async cargarYRenderizar() {
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/notificaciones');
      if (!resp.ok) {
        this.renderVacio();
        return;
      }
      const notificaciones = await resp.json();
      this.renderLista(notificaciones);
    } catch (e) {
      console.warn('No se pudieron cargar notificaciones', e);
      this.renderVacio();
    }
  },

  actualizarBadge() {
    if (!this.badge) return;
    if (this.count > 0) {
      this.badge.textContent = this.count;
      this.badge.hidden = false;
      this.badge.setAttribute('aria-label', `${this.count} notificaciones sin leer`);
    } else {
      this.badge.hidden = true;
      this.badge.setAttribute('aria-label', 'Sin notificaciones sin leer');
    }
  },

  renderLista(notificaciones) {
    if (!this.container) return;
    this.container.innerHTML = '';

    const total = notificaciones.length;
    const noLeidas = notificaciones.filter(n => !n.leida).length;

    // ---------- Encabezado del panel ----------
    const header = document.createElement('div');
    header.className = 'notif-header glass';
    header.innerHTML = `
      <div class="notif-titulo-contenido">
        <div class="notif-icon-header"><i class="fas fa-bell"></i></div>
        <div class="notif-texto">
          <h3>Notificaciones</h3>
          <div class="notif-contador">
            <span>${noLeidas} sin leer</span> ·
            <span>${total} total</span>
          </div>
        </div>
      </div>
      <button type="button" class="btn-link btn-sm" id="btn-marcar-todas" aria-label="Marcar todas como leídas">
        Marcar todas como leídas
      </button>
    `;
    this.container.appendChild(header);

    // ---------- Filtros ----------
    const filtros = document.createElement('div');
    filtros.className = 'notif-filtros glass';
    filtros.innerHTML = `
      <div class="filtro-group" role="radiogroup" aria-label="Filtrar notificaciones">
        <button type="button" class="filtro-btn ${this.filtroActual === 'todos' ? 'activo' : ''}" data-filtro="todos" role="radio" aria-pressed="${this.filtroActual === 'todos'}">
          <span>Todos</span>
          <span class="filtro-count">${total}</span>
        </button>
        <button type="button" class="filtro-btn ${this.filtroActual === 'no-leidas' ? 'activo' : ''}" data-filtro="no-leidas" role="radio" aria-pressed="${this.filtroActual === 'no-leidas'}">
          <span>No leídas</span>
          <span class="filtro-count">${noLeidas}</span>
        </button>
        <button type="button" class="filtro-btn ${this.filtroActual === 'venta' ? 'activo' : ''}" data-filtro="venta" role="radio" aria-pressed="${this.filtroActual === 'venta'}">
          <span><i class="fas fa-shopping-cart"></i> Ventas</span>
          <span class="filtro-count">${notificaciones.filter(n => n.tipo === 'venta').length}</span>
        </button>
        <button type="button" class="filtro-btn ${this.filtroActual === 'stock_bajo' ? 'activo' : ''}" data-filtro="stock_bajo" role="radio" aria-pressed="${this.filtroActual === 'stock_bajo'}">
          <span><i class="fas fa-boxes"></i> Stock bajo</span>
          <span class="filtro-count">${notificaciones.filter(n => n.tipo === 'stock_bajo').length}</span>
        </button>
        <button type="button" class="filtro-btn ${this.filtroActual === 'error' ? 'activo' : ''}" data-filtro="error" role="radio" aria-pressed="${this.filtroActual === 'error'}">
          <span><i class="fas fa-times-circle"></i> Errores</span>
          <span class="filtro-count">${notificaciones.filter(n => n.tipo === 'error').length}</span>
        </button>
        <button type="button" class="filtro-btn ${this.filtroActual === 'info' ? 'activo' : ''}" data-filtro="info" role="radio" aria-pressed="${this.filtroActual === 'info'}">
          <span><i class="fas fa-info-circle"></i> Info</span>
          <span class="filtro-count">${notificaciones.filter(n => n.tipo === 'info').length}</span>
        </button>
      </div>
    `;
    this.container.appendChild(filtros);

    // Divider
    const divider = document.createElement('div');
    divider.className = 'notif-divider';
    this.container.appendChild(divider);

    // ---------- Lista filtrada ----------
    let filtradas = notificaciones;
    if (this.filtroActual === 'no-leidas') {
      filtradas = notificaciones.filter(n => !n.leida);
    } else if (this.filtroActual !== 'todos') {
      filtradas = notificaciones.filter(n => n.tipo === this.filtroActual);
    }

    if (filtradas.length === 0) {
      this.container.appendChild(this.crearEstadoVacio(this.filtroActual));
      return;
    }

    const lista = document.createElement('ul');
    lista.className = 'notif-list';
    lista.setAttribute('role', 'menu');
    lista.setAttribute('aria-label', 'Notificaciones');

    for (const n of filtradas) {
      const item = document.createElement('li');
      item.className = `notif-item ${n.leida ? 'leida' : 'no-leida'} glass`;
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '0');
      item.dataset.id = n.id;

      const icono = this.iconoPara(n.tipo);
      const fecha = this.fechaRelativa(n.creada_en);
      const tipoEtiqueta = this.etiquetaTipo(n.tipo);
      const tipoColor = this.colorTipo(n.tipo);

      item.innerHTML = `
        <div class="notif-badge-tipo" style="background: ${tipoColor}20; color: ${tipoColor};">
          ${tipoEtiqueta}
        </div>
        <div class="notif-contenido-principal">
          <div class="notif-icon">${icono}</div>
          <div class="notif-texto">
            <div class="notif-titulo">${this.escapeHtml(n.titulo)}</div>
            <div class="notif-body">${this.escapeHtml(n.mensaje)}</div>
            <div class="notif-meta">
              <span class="notif-time">${fecha}</span>
              ${n.referencia ? `<span class="notif-ref">Ref: ${this.escapeHtml(n.referencia)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="notif-acciones">
          <span class="notif-estado ${n.leida ? 'leida' : 'no-leida'}">
            ${n.leida ? '<i class="fas fa-check"></i> Leída' : '<i class="fas fa-circle"></i> Nueva'}
          </span>
          <button type="button" class="btn-icon btn-marcar-leida" data-id="${n.id}" aria-label="Marcar como leída">
            <i class="fas fa-check"></i>
          </button>
        </div>
      `;

      const btnLeida = item.querySelector('.btn-marcar-leida');
      if (btnLeida) {
        btnLeida.addEventListener('click', (e) => {
          e.stopPropagation();
          this.marcarLeida(n.id);
        });
      }

      item.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-marcar-leida') && !n.leida) {
          this.marcarLeida(n.id);
        }
      });

      lista.appendChild(item);
    }

    this.container.appendChild(lista);

    // ---------- Botón marcar todas ----------
    const btnTodas = this.container.querySelector('#btn-marcar-todas');
    if (btnTodas) {
      btnTodas.addEventListener('click', () => this.marcarTodasLeidas());
    }

    // ---------- Eventos de filtros ----------
    filtros.querySelectorAll('.filtro-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filtro = btn.dataset.filtro;
        this.filtroActual = filtro;
        // Actualizar estado visual de botones
        filtros.querySelectorAll('.filtro-btn').forEach(b => {
          b.classList.remove('activo');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('activo');
        btn.setAttribute('aria-pressed', 'true');
        // Re-renderizar con nuevo filtro
        this.renderLista(notificaciones);
      });
    });
  },

  crearEstadoVacio(filtro) {
    const div = document.createElement('div');
    div.className = 'notif-vacio glass';
    let texto = 'No tienes notificaciones';
    let subtitulo = '';
    if (filtro === 'no-leidas') {
      texto = 'Todas las notificaciones están leídas';
      subtitulo = 'Revisa más tarde para nuevas actualizaciones';
    } else if (filtro === 'venta') {
      texto = 'No hay ventas registradas';
      subtitulo = 'Las ventas aparecerán aquí automáticamente';
    } else if (filtro === 'stock_bajo') {
      texto = 'Sin alertas de stock bajo';
      subtitulo = 'Todos los productos tienen stock suficiente';
    } else if (filtro === 'error') {
      texto = 'Sin errores reportados';
      subtitulo = 'El sistema está funcionando correctamente';
    } else if (filtro === 'info') {
      texto = 'Sin notificaciones de información';
      subtitulo = 'Los movimientos de inventario aparecerán aquí';
    }
    div.innerHTML = `
      <div class="notif-vacio-icono">📭</div>
      <div class="notif-vacio-contenido">
        <div class="notif-vacio-titulo">${texto}</div>
        ${subtitulo ? `<div class="notif-vacio-subtitulo">${subtitulo}</div>` : ''}
      </div>
    `;
    return div;
  },

  async marcarLeida(id) {
    try {
      const resp = await fetch(`http://127.0.0.1:8000/api/notificaciones/${id}/leer`, {
        method: 'POST',
      });
      if (!resp.ok) return;
      this.cargarContador();
      if (this.panel && !this.panel.hidden) {
        this.cargarYRenderizar();
      }
    } catch (e) {
      console.warn('No se pudo marcar como leída', e);
    }
  },

  async marcarTodasLeidas() {
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/notificaciones/leer-todas', {
        method: 'POST',
      });
      if (!resp.ok) return;
      this.cargarContador();
      if (this.panel && !this.panel.hidden) {
        this.cargarYRenderizar();
      }
    } catch (e) {
      console.warn('No se pudieron marcar todas como leídas', e);
    }
  },

  add(tipo, mensaje, titulo = 'Notificación') {
    this.count++;
    this.actualizarBadge();
    if (tipo === 'error' || tipo === 'venta') {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: tipo === 'venta' ? 'success' : 'error',
        title: titulo,
        text: mensaje,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: { popup: 'glass swal2-popup' },
      });
    }
  },

  iconoPara(tipo) {
    const map = {
      info: '<i class="fas fa-info-circle"></i>',
      success: '<i class="fas fa-check-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      error: '<i class="fas fa-times-circle"></i>',
      venta: '<i class="fas fa-shopping-cart"></i>',
      stock: '<i class="fas fa-boxes"></i>',
      stock_bajo: '<i class="fas fa-exclamation-triangle"></i>',
    };
    return map[tipo] || map.info;
  },

  etiquetaTipo(tipo) {
    const map = {
      venta: 'VENTA',
      stock_bajo: 'STOCK BAJO',
      error: 'ERROR',
      info: 'INVENTARIO',
    };
    return map[tipo] || 'INFO';
  },

  colorTipo(tipo) {
    const map = {
      venta: 'var(--color-success)',
      stock_bajo: 'var(--color-warning)',
      error: 'var(--color-danger)',
      info: 'var(--color-primary)',
    };
    return map[tipo] || 'var(--color-primary)';
  },

  fechaRelativa(iso) {
    if (!iso) return '';
    try {
      const fecha = new Date(iso);
      const ahora = new Date();
      const diffMs = ahora - fecha;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Ahora';
      if (diffMin < 60) return `hace ${diffMin} min`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `hace ${diffH} h`;
      return `hace ${Math.floor(diffH / 24)} d`;
    } catch (e) {
      return '';
    }
  },

  escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  },
};

window.Notifications = Notifications;

document.addEventListener('DOMContentLoaded', () => {
  Notifications.init();
});
