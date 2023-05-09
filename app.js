import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import { wireControls } from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';

var randomId = RandomId();
var routeState;
var prob;

(async function go() {
  window.onerror = reportTopLevelError;
  renderVersion();

  routeState = RouteState({
    followRoute,
    windowObject: window,
  });
  routeState.routeFromHash();
})();

async function followRoute({
  seed,
}) {
  if (!seed) {
    routeState.addToRoute({ seed: randomId(8) });
    return;
  }

  var random = seedrandom(seed);
  prob = Probable({ random });

  wireControls({
    onReset: () => routeState.addToRoute({ seed: randomId(8) }),
  });

}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
