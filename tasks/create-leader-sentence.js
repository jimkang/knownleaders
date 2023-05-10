function createLeaderSentence({ groupName, leaderName, probable }) {
  // TODO: Maybe don't define these every time the function is called?
  var introDef = [
    [1, 'We all know that the'],
    [1, 'Did you know? The'],
  ];
  var introTable = probable.createTableFromSizes(introDef);
  var foundedSlotDef = [
    [2, 'founded'],
    [2, 'started'],
    [1, 'formed'],
    [1, 'created'],
  ];
  var foundedSlotTable = probable.createTableFromSizes(foundedSlotDef);

  var formatTableDef = [
    [
      1,
      (g, l) =>
        `${introTable.roll()} group ${g} was ${foundedSlotTable.roll()} by ${l}.`,
    ],
    [
      1,
      (g, l) =>
        `${introTable.roll()} group ${g} was ${foundedSlotTable.roll()} by lead guitarist ${l}.`,
    ],
    [1, (g, l) => `${introTable.roll()} leader of the group ${g} is ${l}.`],
  ];

  var formatTable = probable.createTableFromSizes(formatTableDef);
  return formatTable.roll()(groupName, leaderName);
}

module.exports = { createLeaderSentence };
