/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');
const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');

module.exports = {
  action: 'fund',
  claims: {
    signature: async ({ userDid }) => {
      const amount = Number((Math.random() * 50).toPrecision(8));
      const { state } = await ForgeSDK.getForgeState({ conn: env.assetChainId });

      return {
        description: `签名该文本，你将获得 ${amount} 个测试用的 ${state.token.symbol}`,
        data: JSON.stringify({ amount, userDid }, null, 2),
        type: 'mime::text/plain',
      };
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    try {
      const type = toTypeInfo(userDid);
      const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('要求的消息签名不正确');
      }

      const app = ForgeSDK.Wallet.fromJSON(wallet);
      const data = JSON.parse(ForgeSDK.Util.fromBase58(claim.data));
      const hash = await ForgeSDK.transfer(
        {
          to: data.userDid,
          token: data.amount,
          wallet: app,
        },
        { conn: env.assetChainId }
      );
      console.log('fund.onAuth', hash, data);
      return { hash };
    } catch (err) {
      console.error('fund.onAuth.error', err);
      throw new Error(`抽奖失败 ${err.message}`);
    }
  },
};
