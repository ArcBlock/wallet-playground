const { swapStorage, wallet } = require('../../libs/auth');

module.exports = {
  action: 'pickup_swap',
  claims: {
    swap: async ({ extraParams: { traceId } }) => {
      const swap = await swapStorage.read(traceId);
      console.log('pickup_swap', swap);

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
