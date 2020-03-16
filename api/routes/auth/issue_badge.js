/* eslint-disable no-console */
const ForgeWallet = require('@arcblock/forge-wallet');
const { create } = require('@arcblock/vc');


const { wallet } = require('../../libs/auth');

const badgeArray = require('../../libs/svg');

module.exports = {
  action: 'issue_badge',
  claims: {
    profile: async () => ({
      description: 'Please provide your name',
      fields: ['fullName'],
    }),
  },

  onAuth: async ({ userDid, userPk ,claims}) => {
    const svg = badgeArray[Math.floor(Math.random() * 10)];
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
      tag: 'badge-01',
    };
  },
};
