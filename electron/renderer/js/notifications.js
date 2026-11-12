/* ========================================================================
   ArepaStock — Panel lateral izquierdo de notificaciones (con backend y polling)
   ======================================================================== */

const Notifications = {
  sidebar: null,
  trigger: null,
  overlay: null,
  list: null,
  badge: null,
  contadorTotal: null,
  contadorNoLeidas: null,
  estadoVacio: null,
  count: 0,
  pollingInterval: null,
  POLL_MS: 30000,
  filtroActual: 'todos', // todos | no-leidas | venta | stock_bajo | error | info

  init() {
    this.sidebar = document.getElementById('notifications-sidebar');
    this.trigger = document.getElementById('btn-notificaciones');
    this.overlay = document.getElementById('overlay-notificaciones');
    this.list = document.getElementById('lista-notificaciones-sidebar');
    this.badge = document.getElementById('badge-notificaciones');
    this.contadorTotal = document.getElementById('contador-total');
    this.contadorNoLeidas = document.getElementById('contador-no-leidas');
    this.estadoVacio = document.getElementById('estado-vacio-sidebar');

    if (!this.sidebar || !this.trigger) return;

    // Botón abrir/cerrar
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Botón cerrar del panel
    const btnCerrar = this.sidebar.querySelector('.btn-cerrar-sidebar');
    if (btnCerrar) {
      btnCerrar.addEventListener('click', () => this.close());
    }

    // Overlay cierra al hacer clic
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    // Tecla Esc cierra
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });

    // Cargar estado inicial y empezar polling
    this.cargarContador();
    this.iniciarPolling();
  },

  toggle() {
    const abierta = !this.sidebar.hidden;
    if (abierta) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    this.sidebar.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    if (this.overlay) this.overlay.hidden = false;
    this.cargarYRenderizar();
  },

  close() {
    this.sidebar.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    if (this.overlay) this.overlay.hidden = true;
  },

  iniciarPolling() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(() => {
      this.cargarContador();
      if (this.sidebar && !this.sidebar.hidden) {
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

    // Actualizar contadores del panel lateral si están visibles
    if (this.contadorTotal) this.contadorTotal.textContent = this.count;
    // El contador de no leídas se actualiza al renderizar la lista
  },

  renderLista(notificaciones) {
    if (!this.list) return;
    this.list.innerHTML = '';

    const total = notificaciones.length;
    const noLeidas = notificaciones.filter(n => !n.leida).length;

    // Actualizar contadores del encabezado
    if (this.contadorTotal) this.contadorTotal.textContent = total;
    if (this.contadorNoLeidas) this.contadorNoLeidas.textContent = noLeidas;

    // Filtrar
    let filtradas = notificaciones;
    if (this.filtroActual === 'no-leidas') {
      filtradas = notificaciones.filter(n => !n.leida);
    } else if (this.filtroActual !== 'todos') {
      filtradas = notificaciones.filter(n => n.tipo === this.filtroActual);
    }

    // Estado vacío
    if (filtradas.length === 0) {
      if (this.estadoVacio) {
        this.estadoVacio.hidden = false;
        // Personalizar mensaje según filtro
        const texto = this.estadoVacio.querySelector('.notif-vacio-texto');
        if (texto) {
          if (this.filtroActual === 'no-leidas') {
            texto.textContent = 'Todas las notificaciones están leídas';
          } else if (this.filtroActual === 'venta') {
            texto.textContent = 'No hay ventas registradas';
          } else if (this.filtroActual === 'stock_bajo') {
            texto.textContent = 'Sin alertas de stock bajo';
          } else if (this.filtroActual === 'error') {
            texto.textContent = 'Sin errores reportados';
          } else if (this.filtroActual === 'info') {
            texto.textContent = 'Sin notificaciones de información';
          } else {
            texto.textContent = 'No tienes notificaciones recientes';
          }
        }
      }
      return;
    }

    if (this.estadoVacio) this.estadoVacio.hidden = true;

    for (const n of filtradas) {
      const item = document.createElement('li');
      item.className = `notif-item-sidebar ${n.leida ? 'leida' : 'no-leida'} glass`;
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '0');
      item.dataset.id = n.id;

      const icono = this.iconoPara(n.tipo);
      const fecha = this.fechaRelativa(n.creada_en);
      const tipoEtiqueta = this.etiquetaTipo(n.tipo);
      const tipoColor = this.colorTipo(n.tipo);

      item.innerHTML = `
        <div class="notif-badge-tipo-sidebar" style="background: ${tipoColor}20; color: ${tipoColor};">
          ${tipoEtiqueta}
        </div>
        <div class="notif-contenido-principal-sidebar">
          <div class="notif-icon-sidebar">${icono}</div>
          <div class="notif-texto-sidebar">
            <div class="notif-titulo-sidebar">${this.escapeHtml(n.titulo)}</div>
            <div class="notif-body-sidebar">${this.escapeHtml(n.mensaje)}</div>
            <div class="notif-meta-sidebar">
              <span class="notif-time-sidebar">${fecha}</span>
              ${n.referencia ? `<span class="notif-ref-sidebar">Ref: ${this.escapeHtml(n.referencia)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="notif-acciones-sidebar">
          <span class="notif-estado-sidebar ${n.leida ? 'leida' : 'no-leida'}">
            ${n.leida ? '<i class="fas fa-check"></i> Leída' : '<i class="fas fa-circle"></i> Nueva'}
          </span>
          <button type="button" class="btn-marcar-leida-sidebar" data-id="${n.id}" aria-label="Marcar como leída">
            <i class="fas fa-check"></i>
          </button>
        </div>
      `;

      const btnLeida = item.querySelector('.btn-marcar-leida-sidebar');
      if (btnLeida) {
        btnLeida.addEventListener('click', (e) => {
          e.stopPropagation();
          this.marcarLeida(n.id);
        });
      }

      item.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-marcar-leida-sidebar') && !n.leida) {
          this.marcarLeida(n.id);
        }
      });

      this.list.appendChild(item);
    }

    // Eventos de filtros
    const filtros = this.sidebar.querySelectorAll('.filtro-btn');
    filtros.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filtro = btn.dataset.filtro;
        this.filtroActual = filtro;
        filtros.forEach(b => {
          b.classList.remove('activo');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('activo');
        btn.setAttribute('aria-pressed', 'true');
        this.cargarYRenderizar();
      });
    });

    // Botón marcar todas como leídas
    const btnTodas = this.sidebar.querySelector('#btn-marcar-todas-sidebar');
    if (btnTodas) {
      btnTodas.addEventListener('click', () => this.marcarTodasLeidas());
    }
  },

  renderVacio() {
    if (!this.list) return;
    this.list.innerHTML = '';
    if (this.estadoVacio) {
      this.estadoVacio.hidden = false;
      const texto = this.estadoVacio.querySelector('.notif-vacio-texto');
      if (texto) texto.textContent = 'No se pudieron cargar las notificaciones';
    }
    if (this.contadorTotal) this.contadorTotal.textContent = '0';
    if (this.contadorNoLeidas) this.contadorNoLeidas.textContent = '0';
  },

  async marcarLeida(id) {
    try {
      const resp = await fetch(`http://127.0.0.1:8000/api/notificaciones/${id}/leer`, {
        method: 'POST',
      });
      if (!resp.ok) return;
      this.cargarContador();
      if (this.sidebar && !this.sidebar.hidden) {
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
      if (this.sidebar && !this.sidebar.hidden) {
        this.cargarYRenderizar();
      }
    } catch (e) {
      console.warn('No se pudieron marcar todas como leídas', e);
    }
  },

  // Método público para agregar notificación local (uso del UI)
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
