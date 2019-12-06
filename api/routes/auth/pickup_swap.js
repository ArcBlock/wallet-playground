const ForgeSDK = require('@arcblock/forge-sdk');
const { swapStorage, wallet } = require('../../libs/auth');
const env = require('../../libs/env');

module.exports = {
  action: 'pickup_swap',
  claims: {
    swap: async ({ extraParams: { traceId } }) => {
      const swap = await swapStorage.read(traceId);
      console.log('pickup_swap', swap);

      const [{ info: offerChainInfo }, { info: demandChainInfo }] = await Promise.all([
        ForgeSDK.getChainInfo({ conn: env.offerChainId }),
        ForgeSDK.getChainInfo({ conn: swap.demandChainId }),
      ]);

      if (
        (swap.demandLocktime && swap.demandLocktime <= demandChainInfo.blockHeight)
        || (swap.offerLocktime && swap.offerLocktime <= offerChainInfo.blockHeight)
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
  onAuth: async ({ claims, userDid, token }) => ({}),
};
