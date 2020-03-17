// eslint-disable-next-line import/prefer-default-export
const badgeArray = [
  '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',
];

module.exports = badgeArray;
