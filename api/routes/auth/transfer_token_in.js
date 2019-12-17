/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');

module.exports = {
  action: 'transfer_token_in',
  claims: {
    signature: async ({ userDid }) => {
      const { state } = await ForgeSDK.getForgeState({ conn: env.assetChainId });

      return {
        description: `签名该文本，你将获得 1 个测试用的 ${state.token.symbol}`,
        data: JSON.stringify({ userDid }, null, 2),
        type: 'mime:text/plain',
      };
    },
  },
  onAuth: async ({ userDid, extraParams: { locale } }) => {
    console.log('transfer_token_in.onAuth', { userDid });
    try {
      const hash = await ForgeSDK.transfer(
        {
          to: userDid,
          token: 1,
          wallet: ForgeSDK.Wallet.fromJSON(wallet),
        },
        { conn: env.chainId }
      );

      console.log('transfer_token_in.onAuth', hash);
      return { hash };
    } catch (err) {
      console.log('transfer_token_in.onAuth.error', err);
      const errors = {
        en: 'Payment failed!',
        zh: '支付失败',
      };
      throw new Error(errors[locale] || errors.en);
    }
  },
};
