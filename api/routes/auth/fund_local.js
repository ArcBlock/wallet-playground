/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');
const { wallet } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');
const env = require('../../libs/env');

module.exports = {
  action: 'fund_local',
  claims: {
    signature: async ({ userDid, extraParams: { locale } }) => {
      const amount = 100 + Number((Math.random() * 500).toPrecision(8));
      const data = await getTokenInfo();
      const description = {
        en: `Sign this text to get ${amount} ${data[env.chainId].symbol} for test`,
        zh: `签名该文本，你将获得 ${amount} 个测试用的 ${data[env.chainId].symbol}`,
      };

      return {
        description: description[locale],
        data: JSON.stringify({ amount, userDid }, null, 2),
        type: 'mime:text/plain',
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
      const data = JSON.parse(ForgeSDK.Util.fromBase58(claim.origin));
      const hash = await ForgeSDK.transfer(
        {
          to: data.userDid,
          token: data.amount,
          wallet: app,
        },
        { conn: env.chainId }
      );
      console.log('fund.onAuth', hash, data);
      return { hash };
    } catch (err) {
      console.error('fund.onAuth.error', err);
      throw new Error(`抽奖失败 ${err.message}`);
    }
  },
};