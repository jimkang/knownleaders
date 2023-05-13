var splitToWords = require('split-to-words');
var {
  commonFirstNames,
  entityGetBaseURL,
  wikimediaImageBaseURL,
} = require('../consts');
const { createLeaderSentence } = require('./create-leader-sentence');

var basicWordBoundaryRegex = /[ ,;!?()]/;

const languageCode = navigator.language.split('-').shift();

// var wikidataIdRegex = /Q\d+$/;

function getLeaderFactForEntity({
  probable,
  // Currently only using groupName from groupEntity, but may later use other stuff.
  groupEntity,
  groupType,
}) {
  const leaderGivenName = probable.pick(commonFirstNames);

  // const selectedLeaderObj = probable.pick(namesObj?.results?.bindings || []);
  // const leaderGivenName = selectedLeaderObj?.nameLabel?.value;
  const leaderSurname = getSurnameFromGroupName(groupEntity.groupName);
  const leaderName = leaderGivenName + ' ' + leaderSurname;

  return {
    groupEntity,
    leaderName,
    sentence: createLeaderSentence({
      groupType,
      groupName: groupEntity.groupName,
      leaderName,
      probable,
    }),
  };
}

// Throws
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

  for (let i = 0; i < maxTries; ++i) {
    let selectedGroupObj = probable.pick(parsed?.results?.bindings || []);
    const wikidataURL = selectedGroupObj?.group?.value;
    const wikidataId = wikidataURL.split('/').pop();
    let entity = await getEntityForWikidataId({ wikidataId, probable, fetch });
    if (entity) {
      return entity;
    }
  }
}

async function getEntityForWikidataId({ wikidataId, probable, fetch }) {
  // Putting origin * in the query gets the wikidata API to put the CORS
  // headers in?!
  let res = await fetch(`${entityGetBaseURL}${wikidataId}`, { mode: 'cors' });
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
    imageURL = wikimediaImageBaseURL + imageURL;
  }
  // TODO: Get Bandcamp links?

  return {
    groupName,
    wikidataId,
    wikipediaURL,
    imageURL,
  };
}

function captializeFirstChar(s) {
  if (s.length < 1) {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getSurnameFromGroupName(groupName) {
  var words = splitToWords(groupName).filter(
    (word) => word.length > 0 && !basicWordBoundaryRegex.test(word.charAt(0))
  );
  if (words.length < 1) {
    return '';
  }
  var word = words[words.length - 1];
  return captializeFirstChar(word);
}

module.exports = {
  getLeaderFactForEntity,
  getRandomEntityFromWikidata,
  getEntityForWikidataId,
};
