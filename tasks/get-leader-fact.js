var splitToWords = require('split-to-words');
var commonFirstNames = require('../consts');

async function getLeaderFact({ probable, handleError, fetch }) {
  var wdObjects;

  try {
    wdObjects = await Promise.all([
      getFromWikidata('https://query.wikidata.org/sparql?query=SELECT%20%3Fgroup%20%3FgroupLabel%20WHERE%20%7B%0A%20%20%3Fgroup%20wdt%3AP31%20wd%3AQ2088357.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%7D%0A'),
      // getFromWikidata('https://query.wikidata.org/sparql?query=SELECT%20%3Fname%20%3FnameLabel%20WHERE%20%7B%0A%20%20%3Fname%20wdt%3AP31%20wd%3AQ202444.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%7D%0A')
    ]);
  } catch (error) {
    handleError(error);
  }
  var groupsObj = wdObjects[0];
  // var namesObj = wdObjects[1];

  var selectedGroupObj = probable.pick(groupsObj?.results?.bindings || []);
  const wikidataId = selectedGroupObj?.group?.value;
  const groupName = selectedGroupObj?.groupLabel?.value;
  const groupWords = splitToWords(groupName);
  // const selectedLeaderObj = probable.pick(namesObj?.results?.bindings || []);
  // const leaderGivenName = selectedLeaderObj?.nameLabel?.value;
  const leaderGivenName = probable.pick(commonFirstNames);
  const leaderName = leaderGivenName + ' ' + groupWords[groupWords.length - 1];

  return {
    wikidataId,
    groupName,
    leaderName,
    sentence: `We all know that the group ${groupName} was founded by ${leaderName}.`
  };
}

async function getFromWikidata(url) {
  var res = await fetch(
    url, { headers: { Accept: 'application/sparql-results+json' } }
  );
  if (!res.ok) {
    throw new Error(
      `Got ${res.status} while trying to find a group to talk about.`
    )
  }

  var parsed = await res.json();
  console.log(parsed);
  return parsed;
}

module.exports = { getLeaderFact };
