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
var thinkingIconEl = document.getElementById('thinking-icon');
var messageEl = document.getElementById('status-message');
var groupLinkEl = document.getElementById('group-link');
var groupImageEl = document.getElementById('group-image');

(async function go() {
  window.onerror = reportTopLevelError;
  renderVersion();

  routeState = RouteState({
    followRoute,
    windowObject: window,
  });
  routeState.routeFromHash();
})();

async function followRoute({ seed, wikidataId }) {
  if (!seed) {
    routeState.addToRoute({ seed: randomId(8) });
    return;
  }

  var random = seedrandom(seed);
  probable = Probable({ random });

  wireControls({
    onReset: () => routeState.addToRoute({ seed: randomId(8), wikidataId: '' }),
  });

  thinkingIconEl.classList.add('spinning');
  messageEl.textContent = 'Retrieving leadership fact…';
  messageEl.classList.remove('hidden');

  var factPack = await getLeaderFact({
    probable,
    handleError,
    fetch: window.fetch,
    routeState,
    wikidataId,
  });
  console.log('factPack', factPack);

  leaderFactEl.textContent = factPack.sentence;
  if (factPack.groupEntity.wikipediaURL) {
    groupLinkEl.setAttribute('href', factPack.groupEntity.wikipediaURL);
    groupLinkEl.textContent = 'Do your own research.';
  } else {
    groupLinkEl.textContent = '';
  }
  if (factPack.groupEntity.imageURL) {
    groupImageEl.setAttribute('src', factPack.groupEntity.imageURL);
    groupImageEl.setAttribute('alt', factPack.groupEntity.groupName);
  } else {
    groupImageEl.removeAttribute('src');
    groupImageEl.removeAttribute('alt');
  }

  thinkingIconEl.classList.remove('spinning');
  messageEl.classList.add('hidden');
  messageEl.textContent = '';
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
