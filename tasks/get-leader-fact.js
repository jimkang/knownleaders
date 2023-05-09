var splitToWords = require('split-to-words');
var { commonFirstNames, bandQueryURL } = require('../consts');

// var wikidataIdRegex = /Q\d+$/;

async function getLeaderFact({ probable, handleError, fetch, maxTries = 100 }) {
  var wdObjects;

  try {
    wdObjects = await Promise.all([
      getFromWikidata(fetch, bandQueryURL),
      // getFromWikidata('https://query.wikidata.org/sparql?query=SELECT%20%3Fname%20%3FnameLabel%20WHERE%20%7B%0A%20%20%3Fname%20wdt%3AP31%20wd%3AQ202444.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%7D%0A')
    ]);
  } catch (error) {
    handleError(error);
  }
  var groupsObj = wdObjects[0];
  // var namesObj = wdObjects[1];

  var wikidataURL;
  var groupName;
  for (let i = 0; i < maxTries; ++i) {
    let selectedGroupObj = probable.pick(groupsObj?.results?.bindings || []);
    wikidataURL = selectedGroupObj?.group?.value;
    groupName = selectedGroupObj?.groupLabel?.value;
    if (!wikidataURL.includes(groupName)) {
      break;
    }
    // Some query results put the wikidata id in the name slot. If we hit one of those, keep looking.
  }

  const groupWords = splitToWords(groupName);
  // const selectedLeaderObj = probable.pick(namesObj?.results?.bindings || []);
  // const leaderGivenName = selectedLeaderObj?.nameLabel?.value;
  const leaderGivenName = probable.pick(commonFirstNames);
  const leaderName = leaderGivenName + ' ' + groupWords[groupWords.length - 1];

  return {
    wikidataURL,
    groupName,
    leaderName,
    sentence: `We all know that the group ${groupName} was founded by ${leaderName}.`,
  };
}

async function getFromWikidata(fetch, url) {
  var res = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json' },
  });
  if (!res.ok) {
    throw new Error(
      `Got ${res.status} while trying to find a group to talk about.`
    );
  }

  var parsed = await res.json();
  console.log(parsed);
  return parsed;
}

module.exports = { getLeaderFact };
