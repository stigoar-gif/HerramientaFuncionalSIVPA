/* ========================================================================
   ArepaStock — Módulo reutilizable de dropdowns (notificaciones + accesibilidad)
   ======================================================================== */

const Dropdown = {
  // Stack de dropdowns abiertos (para manejar múltiples si es necesario)
  openInstances: new Map(),

  // Registrar un dropdown
  register(id, { trigger, panel, overlay, onOpen, onClose }) {
    this.openInstances.set(id, {
      trigger,
      panel,
      overlay,
      onOpen,
      onClose,
      open: false,
    });

    // ARIA en el trigger
    if (trigger) {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', panel ? panel.id : '');
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle(id);
      });
    }

    // Cerrar al hacer clic en el overlay
    if (overlay) {
      overlay.addEventListener('click', () => this.close(id));
    }

    // Cerrar con tecla Esc global
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close(id);
      }
    });
  },

  toggle(id) {
    const inst = this.openInstances.get(id);
    if (!inst) return;
    if (inst.open) {
      this.close(id);
    } else {
      this.open(id);
    }
  },

  open(id) {
    const inst = this.openInstances.get(id);
    if (!inst || inst.open) return;

    // Cerrar otros dropdowns abiertos
    for (const [otherId, otherInst] of this.openInstances.entries()) {
      if (otherId !== id && otherInst.open) {
        this.close(otherId);
      }
    }

    inst.open = true;
    if (inst.panel) {
      inst.panel.hidden = false;
      inst.panel.setAttribute('aria-expanded', 'true');
    }
    if (inst.overlay) {
      inst.overlay.hidden = false;
    }
    if (inst.trigger) {
      inst.trigger.setAttribute('aria-expanded', 'true');
    }
    if (typeof inst.onOpen === 'function') inst.onOpen();
  },

  close(id) {
    const inst = this.openInstances.get(id);
    if (!inst || !inst.open) return;

    inst.open = false;
    if (inst.panel) {
      inst.panel.hidden = true;
      inst.panel.setAttribute('aria-expanded', 'false');
    }
    if (inst.overlay) {
      inst.overlay.hidden = true;
    }
    if (inst.trigger) {
      inst.trigger.setAttribute('aria-expanded', 'false');
    }
    if (typeof inst.onClose === 'function') inst.onClose();
  },

  closeAll() {
    for (const id of this.openInstances.keys()) {
      if (this.openInstances.get(id).open) {
        this.close(id);
      }
    }
  },
};

// Función de utilidad para posicionar un dropdown debajo de su trigger
function posicionarDropdown(panelId, triggerId, overlayId) {
  const panel = document.getElementById(panelId);
  const trigger = document.getElementById(triggerId);
  const overlay = document.getElementById(overlayId);
  if (!panel || !trigger) return;

  const rect = trigger.getBoundingClientRect();
  const panelWidth = 360;
  const panelHeight = 480; // altura máxima del dropdown
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calcular posición horizontal: intentar a la derecha del trigger, ajustar si se sale
  let left = rect.left;
  if (left + panelWidth > viewportWidth) {
    left = viewportWidth - panelWidth - 16; // margen de 16px
  }
  if (left < 16) {
    left = 16;
  }

  // Calcular posición vertical: intentar abajo del trigger, si no cabe, abrir arriba
  let top = rect.bottom + 8;
  let abrirArriba = false;
  if (top + panelHeight > viewportHeight) {
    top = rect.top - panelHeight - 8;
    abrirArriba = true;
  }
  if (top < 16) {
    top = 16;
    abrirArriba = false;
  }

  panel.style.position = 'fixed';
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
  panel.style.width = panelWidth + 'px';
  panel.style.zIndex = '1000';

  // Si se abre arriba, invertir el padding interno del panel para que se vea bien
  if (abrirArriba) {
    panel.style.flexDirection = 'column-reverse';
  } else {
    panel.style.flexDirection = 'column';
  }

  if (overlay) {
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '999';
  }
}

window.Dropdown = Dropdown;
window.posicionarDropdown = posicionarDropdown;
