/* eslint-disable no-console */
const multibase = require('multibase');
const ForgeSDK = require('@arcblock/forge-sdk');
const { fromTokenToUnit } = require('@arcblock/forge-util');
const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');

module.exports = {
  action: 'transfer_token_in',
  claims: {
    signature: async ({ userDid, extraParams: { locale } }) => {
      const { state } = await ForgeSDK.getForgeState({ conn: env.chainId });

      const description = {
        en: `Accept 1 ${state.token.symbol} to your wallet`,
        zh: `接收 1 ${state.token.symbol} 到你的钱包`,
      };

      return {
        txType: 'TransferTx',
        txData: {
          itx: {
            to: userDid,
            value: fromTokenToUnit(1, state.token.decimal),
          },
        },
        description: description[locale] || description.en,
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
