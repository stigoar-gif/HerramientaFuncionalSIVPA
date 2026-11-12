/* ArepaStock — panel de accesibilidad (daltonismo y temas) */

const TEMAS = ['claro', 'oscuro', 'alto-contraste', 'cálido', 'frío'];
const DALTONISMOS = ['general', 'deuteranopia', 'protanopia', 'tritanopia'];

function aplicarTema(theme) {
  if (!TEMAS.includes(theme)) return;
  document.body.dataset.theme = theme;
  const select = document.getElementById('select-tema');
  if (select) select.value = theme;
}

function aplicarDaltonismo(tipo) {
  if (!DALTONISMOS.includes(tipo)) return;
  document.body.dataset.daltonismo = tipo;
  const radios = document.querySelectorAll('input[name="daltonismo"]');
  for (const radio of radios) {
    if (radio.value === tipo) radio.checked = true;
  }
}

function inicializarAccesibilidad() {
  const selectTema = document.getElementById('select-tema');
  const temaGuardado = document.body.dataset.theme || 'claro';
  aplicarTema(temaGuardado);

  selectTema.addEventListener('change', (event) => {
    aplicarTema(event.target.value);
  });

  for (const tipo of DALTONISMOS) {
    const radio = document.querySelector(`input[name="daltonismo"][value="${tipo}"]`);
    if (!radio) continue;
    radio.addEventListener('change', () => {
      if (radio.checked) aplicarDaltonismo(tipo);
    });
  }
}

window.areapastockA11y = {
  aplicarTema,
  aplicarDaltonismo,
  inicializarAccesibilidad,
};

document.addEventListener('DOMContentLoaded', inicializarAccesibilidad);
