/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const ForgeWallet = require('@arcblock/forge-wallet');
const { create } = require('@arcblock/vc');
const { toTypeInfo } = require('@arcblock/did');

const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');

const badgeArray = require('../../libs/svg');

let index = 0;

module.exports = {
  action: 'issue_badge',
  claims: {
    signature: () => ({
      description: '签名该文本，你将获得如下徽章',
      data: getRandomMessage(),
      type: 'mime:text/plain',
      display: JSON.stringify({
        type: 'svg_gzipped',
        content: badgeArray[index % 10],
      }),
    }),
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');
    if (user.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }

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
