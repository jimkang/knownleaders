import OLPE from 'one-listener-per-element';

var resetButtonEl = document.getElementById('reset-button');
var groupTypeSelectEl = document.getElementById('group-type-select');

var { on } = OLPE();

export function wireControls({ onReset, onGroupTypeChange, groupType }) {
  resetButtonEl.removeAttribute('disable');
  on('#reset-button', 'click', onReset);
  on('#group-type-select', 'change', onGroupTypeSelectChange);
  groupTypeSelectEl.value = groupType;

  function onGroupTypeSelectChange() {
    onGroupTypeChange(groupTypeSelectEl.value);
  }
}
