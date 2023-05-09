import OLPE from 'one-listener-per-element';

var resetButtonEl = document.getElementById('reset-button');

var { on } = OLPE();

export function wireControls({ onReset }) {
  resetButtonEl.removeAttribute('disable');
  on('#reset-button', 'click', onReset);
}
