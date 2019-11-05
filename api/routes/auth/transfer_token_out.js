/* eslint-disable no-console */
const multibase = require('multibase');
const ForgeSDK = require('@arcblock/forge-sdk');
const { fromTokenToUnit } = require('@arcblock/forge-util');
const { fromAddress } = require('@arcblock/forge-wallet');
const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');

module.exports = {
  action: 'transfer_token_out',
  claims: {
    signature: async ({ extraParams: { locale } }) => {
      const { state } = await ForgeSDK.getForgeState({ conn: env.chainId });

      const description = {
        en: `Please pay 1 ${state.token.symbol} to unlock the secret document`,
        zh: `请支付 1 ${state.token.symbol} 以解锁加密的文档`,
      };

      return {
        txType: 'TransferTx',
        txData: {
          itx: {
            to: wallet.address,
            value: fromTokenToUnit(1, state.token.decimal),
          },
        },
        description: description[locale] || description.en,
      };
    },
  },
  onAuth: async ({ claims, userDid, extraParams: { locale } }) => {
    console.log('transfer_token_out.onAuth', { claims, userDid });
    try {
      const claim = claims.find(x => x.type === 'signature');
      const tx = ForgeSDK.decodeTx(multibase.decode(claim.origin));
      const user = fromAddress(userDid);

      const hash = await ForgeSDK.sendTransferTx({
        tx,
        wallet: user,
        signature: claim.sig,
      });

      console.log('transfer_token_out.onAuth', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      console.log('transfer_token_out.onAuth.error', err);
      const errors = {
        en: 'Payment failed!',
        zh: '支付失败',
      };
      throw new Error(errors[locale] || errors.en);
    }
  },
};
