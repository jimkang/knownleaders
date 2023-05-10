var splitToWords = require('split-to-words');
var { commonFirstNames, bandEntitiesURL } = require('../consts');

const languageCode = navigator.language.split('-').shift();

// var wikidataIdRegex = /Q\d+$/;

async function getLeaderFact({ probable, handleError, fetch }) {
  var groupEntity;

  try {
    groupEntity = await getRandomEntityFromWikidata({
      fetch,
      entitiesURL: bandEntitiesURL,
      probable,
    });
  } catch (error) {
    handleError(error);
  }

  const groupWords = splitToWords(groupEntity.groupName);
  // const selectedLeaderObj = probable.pick(namesObj?.results?.bindings || []);
  // const leaderGivenName = selectedLeaderObj?.nameLabel?.value;
  const leaderGivenName = probable.pick(commonFirstNames);
  const leaderName = leaderGivenName + ' ' + groupWords[groupWords.length - 1];

  return {
    groupEntity,
    leaderName,
    sentence: `We all know that the group ${groupEntity.groupName} was founded by ${leaderName}.`,
  };
}

async function getRandomEntityFromWikidata({
  fetch,
  entitiesURL,
  probable,
  maxTries = 100,
}) {
  var res = await fetch(entitiesURL, {
    headers: { Accept: 'application/sparql-results+json' },
  });
  if (!res.ok) {
    throw new Error(
      `Got ${res.status} while trying to find a group to talk about.`
    );
  }

  var parsed = await res.json();
  console.log(parsed);

  for (let i = 0; i < maxTries; ++i) {
    let selectedGroupObj = probable.pick(parsed?.results?.bindings || []);
    const wikidataURL = selectedGroupObj?.group?.value;
    console.log(wikidataURL);
    const wikidataId = wikidataURL.split('/').pop();
    // Putting origin * in the query gets the wikidata API to put the CORS
    // headers in?!
    let res = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&ids=${wikidataId}`,
      { mode: 'cors' }
    );
    if (!res.ok) {
      continue;
    }
    let entityResult = await res.json();
    let entity = entityResult?.entities[wikidataId];
    if (!entity) {
      continue;
    }
    console.log(entity);
    let groupName = entity?.labels[languageCode]?.value;
    if (!groupName && entity.labels) {
      groupName = probable.pick(Object.values(entity.labels))?.value;
    }
    if (!groupName) {
      continue;
    }

    let wikipediaURL;
    if (entity.sitelinks) {
      let sitelink = entity.sitelinks[languageCode + 'wiki'];
      if (!sitelink) {
        sitelink = probable.pick(Object.values(entity.sitelinks));
      }
      if (sitelink) {
        wikipediaURL = `https://${sitelink.site.replace(/wiki$/, '')}.wikipedia.org/wiki/${sitelink.title}`;
      }
    }
    // TODO: Get Bandcamp links?

    return {
      groupName,
      wikidataId,
      wikipediaURL,
    };
  }
}

module.exports = { getLeaderFact };
