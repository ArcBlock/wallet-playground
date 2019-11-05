/* eslint-disable no-console */
/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');

const env = require('../../libs/env');
const { swapStorage, wallet } = require('../../libs/auth');

module.exports = {
  action: 'swap-token',
  claims: {
    swap: async ({ userDid, extraParams: { traceId } }) => {
      try {
        const payload = {
          offerAssets: [],
          offerToken: (await ForgeSDK.fromTokenToUnit(5, { conn: env.chainId })).toString(),
          offerUserAddress: wallet.address, // 卖家地址
          demandAssets: [],
          demandToken: (await ForgeSDK.fromTokenToUnit(1, { conn: env.assetChainId })).toString(),
          demandUserAddress: userDid, // 买家地址
          demandLocktime: await ForgeSDK.toLocktime(57600, { conn: env.assetChainId }),
        };

        const res = await swapStorage.finalize(traceId, payload);
        console.log('swap.finalize', res);
        const swap = await swapStorage.read(traceId);

        return {
          swapId: traceId,
          receiver: wallet.address,
          ...swap,
        };
      } catch (err) {
        console.error(err);
        throw new Error('换币失败，请重试');
      }
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    return {};
  },
};
