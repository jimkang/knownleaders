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

  try {
    var res = await fetch(
      'https://query.wikidata.org/sparql?query=SELECT%20%3Fgroup%20%3FgroupLabel%20WHERE%20%7B%0A%20%20%3Fgroup%20wdt%3AP31%20wd%3AQ2088357.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%7D%0A',
      { headers: { 'Accept': 'application/sparql-results+json' } });
    if (!res.ok) {
      handleError(new Error(`Got ${res.status} while trying to find a group to talk about.`));
      return;
    }

    var groupsObj = await res.json();
    console.log(groupsObj);
  } catch (error) {
    handleError(error);
  }
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
