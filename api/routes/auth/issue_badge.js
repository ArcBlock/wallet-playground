/* eslint-disable no-console */
const ForgeWallet = require('@arcblock/forge-wallet');
const { create } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');

const badgeArray = require('../../libs/svg');

let index = 0;

module.exports = {
  action: 'issue_badge',
  claims: {
    profile: async () => ({
      description: 'Please provide your name',
      fields: ['fullName'],
    }),
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const svg = badgeArray[index % 10];
    index += 1;
    const w = ForgeWallet.fromJSON(wallet);

    const vc = create({
      type: 'WalletPlaygroundAchievement',
      issuer: {
        wallet: w,
        name: 'ArcBlock.Badge',
      },
      subject: {
        id: userDid,
        name: 'Wallet Playground Completion',
        description: 'Master of Cross Border Money Transfer',
        display: {
          type: 'svg_gzipped',
          content: svg,
        },
      },
    });
    return {
      disposition: 'attachment',
      type: 'VerifiableCredential',
      data: vc,
      tag: `badge-${index % 10}`,
    };
  },
};
