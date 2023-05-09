import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import { wireControls } from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';
import { getLeaderFact } from './tasks/get-leader-fact';

var randomId = RandomId();
var routeState;
var probable;
var leaderFactEl = document.getElementById('leader-fact');

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
  probable = Probable({ random });

  wireControls({
    onReset: () => routeState.addToRoute({ seed: randomId(8) }),
  });

  var factPack = await getLeaderFact({ probable, handleError, fetch: window.fetch });
  console.log('factPack', factPack);
  leaderFactEl.textContent = factPack.sentence;
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
