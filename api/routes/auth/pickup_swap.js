const ForgeSDK = require('@arcblock/forge-sdk');
const { swapStorage, wallet } = require('../../libs/auth');
const env = require('../../libs/env');

module.exports = {
  action: 'pickup_swap',
  claims: {
    swap: async ({ extraParams: { traceId } }) => {
      const [{ info: appChainInfo }, { info: assetChainInfo }] = await Promise.all([
        ForgeSDK.getChainInfo({ conn: env.chainId }),
        ForgeSDK.getChainInfo({ conn: env.assetChainId }),
      ]);

      const swap = await swapStorage.read(traceId);
      console.log('pickup_swap', swap);

      if (
        swap.demandLocktime <= assetChainInfo.blockHeight ||
        swap.offerLocktime <= appChainInfo.blockHeight
      ) {
        throw new Error('This order has expired, please place another order');
      }

      return {
        swapId: traceId,
        receiver: wallet.address,
        ...swap,
      };
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    return {};
  },
};
