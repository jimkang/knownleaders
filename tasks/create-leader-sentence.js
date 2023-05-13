var introDef = [
  [1, 'We all know that the'],
  [1, 'Did you know? The'],
  [1, 'It is known: The'],
  [1, 'Fact: The'],
  [8, 'The'],
];
var foundedSlotDef = [
  [2, 'founded'],
  [2, 'started'],
  [1, 'formed'],
  [1, 'created'],
];

var groupNamesForGroupTypes = {
  'music-group': 'group',
  game: 'game',
  novel: 'novel',
  organization: 'organization',
};

var generalLeaderRoleDef = [
  [1, 'MC'],
  [1, 'DJ'],
  [2, 'maestro'],
  [2, 'visionary'],
  [1, 'entrepreneur'],
  [1, 'lead dancer'],
  [2, 'main genius'],
  [2, 'great leader'],
  [1, 'innovator'],
  [1, 'torchbearer'],
];

var fictionalRoleDef = [
  [1, 'hero'],
  [1, 'protagonist'],
  [1, 'main character'],
];

var leaderRoleDefsForGroupTypes = {
  'music-group': [
    // [3, generalLeaderRoleDef],
    // Minification mangling is triggering some bug in nested tables.
    [2, 'maestro'],
    [2, 'visionary'],
    [1, 'entrepreneur'],
    [1, 'lead dancer'],
    [2, 'main genius'],
    [2, 'great leader'],
    [1, 'innovator'],
    [1, 'torchbearer'],
    [4, 'lead guitarist'],
    [4, 'lead singer'],
    [1, 'lead guitarist and lead singer'],
    [5, 'MC'],
    [5, 'DJ'],
    [4, 'lead dancer'],
  ],
  game: fictionalRoleDef,
  novel: fictionalRoleDef,
  organization: [
    [3, 'president'],
    [3, 'chairperson'],
    [3, 'supreme leader'],
    [3, 'CEO'],
    [1, 'MC'],
    [1, 'DJ'],
    [2, 'maestro'],
    [2, 'visionary'],
    [1, 'entrepreneur'],
    [1, 'lead dancer'],
    [2, 'main genius'],
    [2, 'great leader'],
    [1, 'innovator'],
    [1, 'torchbearer'],
  ],
};

function createLeaderSentence({ groupName, leaderName, probable, groupType }) {
  // TODO: Maybe don't define these every time the function is called?
  var introTable = probable.createTableFromSizes(introDef);
  var foundedSlotTable = probable.createTableFromSizes(foundedSlotDef);
  var leaderRoleTable = probable.createTableFromSizes(
    leaderRoleDefsForGroupTypes[groupType] || generalLeaderRoleDef
  );
  const groupTerm = groupNamesForGroupTypes[groupType];

  var formatTableDef = [
    [
      1,
      (g, l) =>
        `${introTable.roll()} ${groupTerm} ${g} was ${foundedSlotTable.roll()} by ${l}.`,
    ],
    [
      1,
      (g, l) =>
        `${introTable.roll()} ${groupTerm} ${g} was ${foundedSlotTable.roll()} by ${leaderRoleTable.roll()} ${l}.`,
    ],
    [
      1,
      (g, l) => `${introTable.roll()} leader of the ${groupTerm} ${g} is ${l}.`,
    ],
  ];

  if (groupType === 'game') {
    formatTableDef = [
      [1, (g, l) => `${l} is the ${leaderRoleTable.roll()} of the game ${g}.`],
    ];
  }

  if (groupType === 'novel') {
    groupName = `<u>${groupName}</u>`;
    formatTableDef = [
      [1, (g, l) => `${l} is the ${leaderRoleTable.roll()} in ${g}.`],
    ];
  }

  var formatTable = probable.createTableFromSizes(formatTableDef);
  return formatTable.roll()(groupName, leaderName);
}

module.exports = { createLeaderSentence };
