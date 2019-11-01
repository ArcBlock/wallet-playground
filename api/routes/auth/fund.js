/* eslint-disable no-console */
const multibase = require('multibase');
const ForgeSDK = require('@arcblock/forge-sdk');
const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'fund',
  claims: {
    signature: async ({ extraParams: { locale } }) => {
      const amount = Number((Math.random() * 50).toPrecision(8));
      const { state } = await ForgeSDK.getForgeState({ conn: env.assetChainId });

      const description = {
        en: `Sign this transaction to receive ${amount} ${state.token.symbol} for test purpose`,
        zh: `签名该交易，你将获得 ${amount} 个测试用的 ${state.token.symbol}`,
      };

      return {
        txType: 'ExchangeTx',
        txData: {
          itx: {
            to: wallet.address,
            sender: {
              value: await ForgeSDK.fromTokenToUnit(0, { conn: env.assetChainId }),
              assets: [],
            },
            receiver: {
              value: await ForgeSDK.fromTokenToUnit(amount, { conn: env.assetChainId }),
              assets: [],
            },
          },
        },
        description: description[locale] || description.en,
        chainInfo: {
          chainHost: env.assetChainHost,
          chainId: env.assetChainId,
        },
      };
    },
  },

  onAuth: async ({ claims, extraParams: { locale } }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      const tx1 = ForgeSDK.decodeTx(multibase.decode(claim.origin));
      const app = ForgeSDK.Wallet.fromJSON(wallet);

      tx1.signature = claim.sig;

      const tx2 = await ForgeSDK.multiSignExchangeTx(
        {
          tx: tx1,
          wallet: app,
        },
        { conn: env.assetChainId }
      );
      console.log('fund.onAuth.claim', claim);
      console.log('fund.onAuth.tx', tx2);
      console.log('fund.onAuth.itx', ForgeSDK.Message.decodeAny(tx2.itx));

      const hash = await ForgeSDK.sendExchangeTx(
        {
          tx: tx2,
          wallet: app,
        },
        { conn: env.assetChainId }
      );
      console.log('fund.onAuth', hash);
      return { hash, tx: tx2 };
    } catch (err) {
      console.error('fund.onAuth.error', err);
      const errors = {
        en: 'Lucky token distribute failed, please try again!',
        zh: '抽奖失败，请重试',
      };
      throw new Error(errors[locale] || errors.en);
    }
  },
};
