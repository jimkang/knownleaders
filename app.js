import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import { wireControls } from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';
import { getLeaderFact } from './tasks/get-leader-fact';

var randomId = RandomId({ onlyLowercase: true });
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

function followRoute({ seed, wikidataId, groupType }) {
  var routeUpdates = {};
  if (!seed) {
    routeUpdates.seed = randomId(8);
  }
  if (!groupType) {
    routeUpdates.groupType = 'music-group';
  }
  if (Object.keys(routeUpdates).length > 0) {
    routeState.addToRoute(routeUpdates);
    return;
  }

  var random = seedrandom(seed);
  probable = Probable({ random });

  wireControls({
    // Don't update by blanking out wikidataId in the route because that will
    // add a history item that makes it unpleasant to try to get back to a 
    // previous leader in the browsing session.
    onReset: () => updateLeader({ wikidataId: null }),
    onGroupTypeChange: (groupType) => routeState.addToRoute({ groupType }),
    groupType,
  });

  updateLeader({ wikidataId });

  async function updateLeader({ wikidataId }) {
    thinkingIconEl.classList.add('spinning');
    messageEl.textContent = 'Retrieving leadership fact…';
    messageEl.classList.remove('hidden');

    var factPack = await getLeaderFact({
      probable,
      handleError,
      fetch: window.fetch,
      routeState,
      wikidataId,
      groupType,
    });

    leaderFactEl.innerHTML = factPack.sentence;
    if (factPack.groupEntity.wikipediaURL) {
      groupLinkEl.setAttribute('href', factPack.groupEntity.wikipediaURL);
      groupLinkEl.textContent = 'Do your own research.';
    } else {
      groupLinkEl.textContent = '';
    }
    if (factPack.groupEntity.imageURL) {
      groupImageEl.setAttribute('src', factPack.groupEntity.imageURL);
      groupImageEl.setAttribute('alt', factPack.groupEntity.groupName);
      groupImageEl.classList.remove('hidden');
    } else {
      groupImageEl.removeAttribute('src');
      groupImageEl.removeAttribute('alt');
      // On Mobile Safari, an img with its src removed still takes up space.
      groupImageEl.classList.add('hidden');
    }

    thinkingIconEl.classList.remove('spinning');
    messageEl.classList.add('hidden');
    messageEl.textContent = '';
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
