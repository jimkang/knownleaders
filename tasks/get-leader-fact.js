var splitToWords = require('split-to-words');
var { commonFirstNames, bandEntitiesURL } = require('../consts');

const languageCode = navigator.language.split('-').shift();

// var wikidataIdRegex = /Q\d+$/;

async function getLeaderFact({
  probable,
  handleError,
  fetch,
  routeState,
  wikidataId,
}) {
  var groupEntity;

  try {
    if (wikidataId) {
      groupEntity = await getEntityForWikidataId({ wikidataId, probable });
    } else {
      groupEntity = await getRandomEntityFromWikidata({
        fetch,
        entitiesURL: bandEntitiesURL,
        probable,
        routeState,
      });
    }
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
  routeState,
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

  for (let i = 0; i < maxTries; ++i) {
    let selectedGroupObj = probable.pick(parsed?.results?.bindings || []);
    const wikidataURL = selectedGroupObj?.group?.value;
    const wikidataId = wikidataURL.split('/').pop();
    let entity = await getEntityForWikidataId({ wikidataId, probable });
    if (entity) {
      routeState.addToRoute({ wikidataId }, false);
      return entity;
    }
  }
}

async function getEntityForWikidataId({ wikidataId, probable }) {
  // Putting origin * in the query gets the wikidata API to put the CORS
  // headers in?!
  let res = await fetch(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels|sitelinks|claims&format=json&origin=*&ids=${wikidataId}`,
    { mode: 'cors' }
  );
  if (!res.ok) {
    return;
  }
  let entityResult = await res.json();
  let entity = entityResult?.entities[wikidataId];
  if (!entity) {
    return;
  }
  let groupName = entity?.labels[languageCode]?.value;
  if (!groupName && entity.labels) {
    groupName = probable.pick(Object.values(entity.labels))?.value;
  }
  if (!groupName) {
    return;
  }

  // Once we have the group name, everything else is optional.
  let wikipediaURL;
  if (entity.sitelinks) {
    let sitelink = entity.sitelinks[languageCode + 'wiki'];
    if (!sitelink) {
      sitelink = probable.pick(Object.values(entity.sitelinks));
    }
    if (sitelink) {
      wikipediaURL = `https://${sitelink.site.replace(
        /wiki$/,
        ''
      )}.wikipedia.org/wiki/${sitelink.title}`;
    }
  }

  let imageURL = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (imageURL) {
    imageURL =
      'https://commons.wikimedia.org/wiki/Special:FilePath/' + imageURL;
  }
  console.log('imageURL', imageURL);
  // TODO: Get Bandcamp links?

  return {
    groupName,
    wikidataId,
    wikipediaURL,
    imageURL,
  };
}

module.exports = { getLeaderFact };
