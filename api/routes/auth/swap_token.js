/* eslint-disable no-console */
/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');

const env = require('../../libs/env');
const { swapStorage, wallet } = require('../../libs/auth');
const { getExchangeRate } = require('../../libs/currency');

const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);

module.exports = {
  action: 'swap-token',
  claims: {
    swap: async ({ userDid, extraParams: { traceId, action } }) => {
      const rate = isNetlify ? getExchangeRate() : 5;
      if (action === 'buy') {
        // User buy 1 TBA with 5 Play
        try {
          const payload = {
            offerChainId: env.assetChainId,
            offerChainHost: env.assetChainHost,
            offerAssets: [],
            offerToken: (await ForgeSDK.fromTokenToUnit(1, { conn: env.assetChainId })).toString(),
            offerUserAddress: wallet.address, // 卖家地址

            demandChainId: env.chainId,
            demandChainHost: env.chainHost,
            demandAssets: [],
            demandToken: (await ForgeSDK.fromTokenToUnit(rate, { conn: env.chainId })).toString(),
            demandUserAddress: userDid, // 买家地址
            demandLocktime: await ForgeSDK.toLocktime(2400, { conn: env.chainId }),
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
      }

      if (action === 'sell') {
        // User sell 1 TBA for 5 Play
        try {
          const payload = {
            offerChainId: env.chainId,
            offerChainHost: env.chainHost,
            offerAssets: [],
            offerToken: (await ForgeSDK.fromTokenToUnit(rate, { conn: env.chainId })).toString(),
            offerUserAddress: wallet.address, // 卖家地址

            demandChainId: env.assetChainId,
            demandChainHost: env.assetChainHost,
            demandAssets: [],
            demandToken: (await ForgeSDK.fromTokenToUnit(1, { conn: env.assetChainId })).toString(),
            demandUserAddress: userDid, // 买家地址
            demandLocktime: await ForgeSDK.toLocktime(2400, { conn: env.assetChainId }),
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
      }

      throw new Error(`Unsupported token swap action ${action}`);
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    return {};
  },
};
