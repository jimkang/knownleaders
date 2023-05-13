import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import { wireControls } from './renderers/wire-controls';
import seedrandom from 'seedrandom';
import RandomId from '@jimkang/randomid';
import { createProbable as Probable } from 'probable';
import {
  getEntityForWikidataId,
  getLeaderFactForEntity,
  getRandomEntityFromWikidata,
} from './tasks/get-leader-fact';
import { entitiesURLsForGroupType } from './consts';

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
    onReset() {
      updateLeader({ wikidataId: null });
    },
    onGroupTypeChange(gt) {
      // If the groupType selection changes, don't update the route yet
      // because we don't want the leader fact to change until the reset button
      // is clicked.
      // However, we DO want groupType to be updated for when onReset is called!
      // So, we change it here, and it will update the route if its value is different
      // from what's in the hash.
      groupType = gt;
    },
    groupType,
  });

  updateLeader({ wikidataId });

  async function updateLeader({ wikidataId }) {
    thinkingIconEl.classList.add('spinning');
    messageEl.textContent = 'Retrieving leadership fact…';
    messageEl.classList.remove('hidden');

    var groupEntity;
    var nextSeed = seed;
    const shouldUpdateRoute =
      !wikidataId || routeState.getRouteFromHash()?.groupType !== groupType;

    try {
      if (wikidataId) {
        // Use up a decision with the seed so that the same amount of random calls
        // happen whether a wikidataId is pre-supplied or not.
        probable.roll();

        groupEntity = await getEntityForWikidataId({
          wikidataId,
          probable,
          fetch: window.fetch,
        });
        // In this case, don't update the seed and probable so that when names
        // are picked, they're exactly the same choices as when they were chosen
        // in the else clause below.
      } else {
        // Use the current seed to get the next seed.
        randomId = RandomId({ onlyLowercase: true, random });
        nextSeed = randomId(8);
        // Use the next seed to get the entity.
        random = seedrandom(nextSeed);
        probable = Probable({ random });
        groupEntity = await getRandomEntityFromWikidata({
          fetch: window.fetch,
          entitiesURL: entitiesURLsForGroupType[groupType],
          probable,
        });
        wikidataId = groupEntity.wikidataId;
      }

      let factPack = getLeaderFactForEntity({
        probable,
        groupEntity,
        groupType,
      });
      renderFactPack(factPack);

      thinkingIconEl.classList.remove('spinning');
      messageEl.classList.add('hidden');
      messageEl.textContent = '';

      // Set the route hash so that on reload, we get exactly the same thing.
      if (shouldUpdateRoute) {
        routeState.addToRoute({ seed: nextSeed, wikidataId, groupType }, false);
      }
    } catch (error) {
      handleError(error);
    }
  }
}

async function renderFactPack(factPack) {
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
}
function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
