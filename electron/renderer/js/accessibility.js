/* ========================================================================
   ArepaStock — Panel de accesibilidad visual (modos de visión y temas)
   ======================================================================== */

const Accesibilidad = {
  TEMAS: ['claro', 'oscuro', 'alto-contraste', 'cálido', 'frío'],
  VISIONES: ['normal', 'deuteranopia', 'protanopia', 'tritanopia', 'daltonismo'],
  FONT_SCALES: ['100', '125', '150'],

  panel: null,
  trigger: null,
  overlay: null,
  estado: {
    tema: 'claro',
    vision: 'normal',
    fontScale: '100',
    reduceMotion: false,
    underlineLinks: false,
  },

  init() {
    this.panel = document.getElementById('a11y-panel');
    this.trigger = document.getElementById('btn-accesibilidad');
    this.overlay = document.getElementById('overlay-a11y');

    if (!this.panel || !this.trigger) return;

    // Registrar en el módulo Dropdown (onOpen hace render + posicionamiento)
    Dropdown.register('accesibilidad', {
      trigger: this.trigger,
      panel: this.panel,
      overlay: this.overlay,
      onOpen: () => {
        this.render();
        posicionarDropdown('a11y-panel', 'btn-accesibilidad', 'overlay-accesibilidad');
      },
      onClose: () => {},
    });

    // Cargar estado persistido
    this.cargarEstado();
    this.aplicarEstado();

    // Eventos internos del panel (delegados)
    this.panel.addEventListener('change', (e) => this.onCambio(e));
    this.panel.addEventListener('click', (e) => this.onClick(e));
  },

  cargarEstado() {
    try {
      const guardado = localStorage.getItem('arepastock:accesibilidad');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        this.estado = { ...this.estado, ...parsed };
      }
    } catch (e) {
      console.warn('No se pudo leer accesibilidad de localStorage', e);
    }
  },

  guardarEstado() {
    try {
      localStorage.setItem('arepastock:accesibilidad', JSON.stringify(this.estado));
    } catch (e) {
      console.warn('No se pudo guardar accesibilidad en localStorage', e);
    }
  },

  aplicarEstado() {
    // Tema
    document.body.dataset.theme = this.estado.tema;
    // Visión
    document.body.dataset.vision = this.estado.vision;
    // Escala de texto
    document.body.dataset.fontScale = this.estado.fontScale;
    // Reducir movimiento
    document.body.dataset.reduceMotion = this.estado.reduceMotion ? 'true' : 'false';
    // Subrayar enlaces
    document.body.dataset.underlineLinks = this.estado.underlineLinks ? 'true' : 'false';
  },

  render() {
    if (!this.panel) return;

    this.panel.innerHTML = `
      <div class="a11y-header">
        <h3 id="a11y-panel-title">Accesibilidad visual</h3>
        <button type="button" class="btn-icon btn-cerrar-a11y" aria-label="Cerrar panel de accesibilidad">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="a11y-divider"></div>

      <!-- Tema -->
      <section class="a11y-section">
        <label class="a11y-label" for="a11y-select-tema">Tema</label>
        <select class="a11y-select" id="a11y-select-tema">
          ${this.TEMAS.map(t => `
            <option value="${t}" ${this.estado.tema === t ? 'selected' : ''}>
              ${this.etiquetaTema(t)}
            </option>
          `).join('')}
        </select>
      </section>

      <div class="a11y-divider"></div>

      <!-- Modo de visión -->
      <section class="a11y-section">
        <fieldset class="a11y-fieldset">
          <legend class="a11y-legend">Modo de visión</legend>
          ${this.VISIONES.map(v => `
            <label class="a11y-option" tabindex="0">
              <input type="radio" name="a11y-vision" value="${v}" ${this.estado.vision === v ? 'checked' : ''}>
              <span class="a11y-option-radio"></span>
              <span>${this.etiquetaVision(v)}</span>
            </label>
          `).join('')}
        </fieldset>
      </section>

      <div class="a11y-divider"></div>

      <!-- Opciones adicionales -->
      <section class="a11y-section">
        <label class="a11y-label" for="a11y-select-font">Tamaño de texto</label>
        <select class="a11y-select" id="a11y-select-font">
          ${this.FONT_SCALES.map(s => `
            <option value="${s}" ${this.estado.fontScale === s ? 'selected' : ''}>${s}%</option>
          `).join('')}
        </select>

        <label class="a11y-option-checkbox" tabindex="0">
          <input type="checkbox" id="a11y-reduce-motion" ${this.estado.reduceMotion ? 'checked' : ''}>
          <span class="a11y-option-checkbox-mark"></span>
          <span>Reducir movimiento</span>
        </label>

        <label class="a11y-option-checkbox" tabindex="0">
          <input type="checkbox" id="a11y-underline-links" ${this.estado.underlineLinks ? 'checked' : ''}>
          <span class="a11y-option-checkbox-mark"></span>
          <span>Subrayar enlaces</span>
        </label>
      </section>

      <div class="a11y-divider"></div>

      <div class="a11y-footer">
        <button type="button" class="btn btn-outline btn-restablecer">
          <i class="fas fa-undo" aria-hidden="true"></i>
          <span>Restablecer</span>
        </button>
      </div>
    `;

    // Conectar eventos de los nuevos elementos
    this.conectarEventosPanel();
  },

  conectarEventosPanel() {
    const selectTema = this.panel.querySelector('#a11y-select-tema');
    const selectFont = this.panel.querySelector('#a11y-select-font');
    const chkMotion = this.panel.querySelector('#a11y-reduce-motion');
    const chkLinks = this.panel.querySelector('#a11y-underline-links');
    const btnReset = this.panel.querySelector('.btn-restablecer');
    const btnClose = this.panel.querySelector('.btn-cerrar-a11y');
    const radios = this.panel.querySelectorAll('input[name="a11y-vision"]');

    if (selectTema) {
      selectTema.addEventListener('change', (e) => {
        this.estado.tema = e.target.value;
        this.aplicarEstado();
        this.guardarEstado();
      });
    }
    if (selectFont) {
      selectFont.addEventListener('change', (e) => {
        this.estado.fontScale = e.target.value;
        this.aplicarEstado();
        this.guardarEstado();
      });
    }
    if (chkMotion) {
      chkMotion.addEventListener('change', (e) => {
        this.estado.reduceMotion = e.target.checked;
        this.aplicarEstado();
        this.guardarEstado();
      });
    }
    if (chkLinks) {
      chkLinks.addEventListener('change', (e) => {
        this.estado.underlineLinks = e.target.checked;
        this.aplicarEstado();
        this.guardarEstado();
      });
    }
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.estado = { tema: 'claro', vision: 'normal', fontScale: '100', reduceMotion: false, underlineLinks: false };
        this.aplicarEstado();
        this.guardarEstado();
        this.render();
      });
    }
    if (btnClose) {
      btnClose.addEventListener('click', () => Dropdown.close('accesibilidad'));
    }
    for (const radio of radios) {
      radio.addEventListener('change', (e) => {
        this.estado.vision = e.target.value;
        this.aplicarEstado();
        this.guardarEstado();
      });
    }
  },

  onCambio(e) {
    // Manejador delegado por si se agregan dinámicamente
  },

  onClick(e) {
    // Prevenir que clics dentro del panel cierren el dropdown
    e.stopPropagation();
  },

  etiquetaTema(t) {
    const map = {
      claro: 'Claro (marca)',
      oscuro: 'Oscuro',
      'alto-contraste': 'Alto contraste',
      cálido: 'Cálido (maíz/arepa)',
      frío: 'Frío (verdes/azules)',
    };
    return map[t] || t;
  },

  etiquetaVision(v) {
    const map = {
      normal: 'Normal',
      deuteranopia: 'Deuteranopía',
      protanopia: 'Protanopía',
      tritanopia: 'Tritanopía',
      daltonismo: 'Daltonismo general',
    };
    return map[v] || v;
  },
};

window.Accesibilidad = Accesibilidad;

document.addEventListener('DOMContentLoaded', () => {
  Accesibilidad.init();
});
