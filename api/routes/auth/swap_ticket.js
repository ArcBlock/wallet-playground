/* eslint-disable no-console */
/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetIssuer } = require('@arcblock/asset-factory');

const env = require('../../libs/env');
const { swapStorage, wallet, factory } = require('../../libs/auth');

const ensureAsset = async (userPk, userDid) => {
  const [asset] = await factory.createTicket({
    backgroundUrl: '',
    data: {
      name: 'ArcBlock DevCon0',
      description: '首届官方 ArcBlock 全球开发者大会',
      location: '中国上海华东师范大学',
      logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
      startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
      endTime: Date.now() + 8 * 24 * 60 * 60 * 1000,
      host: new AssetIssuer({
        wallet: ForgeSDK.Wallet.fromJSON(wallet),
        name: userDid,
      }),
    },
  });

  return asset;
};

module.exports = {
  action: 'swap-ticket',
  claims: {
    swap: async ({ userDid, userPk, extraParams: { traceId } }) => {
      try {
        const asset = await ensureAsset(userPk, userDid);
        const payload = {
          offerAssets: [asset.address],
          offerToken: (await ForgeSDK.fromTokenToUnit(0, { conn: env.chainId })).toString(),
          offerUserAddress: wallet.address, // 卖家地址
          demandAssets: [],
          demandToken: (await ForgeSDK.fromTokenToUnit(19.9, { conn: env.assetChainId })).toString(),
          demandUserAddress: userDid, // 买家地址
          demandLocktime: await ForgeSDK.toLocktime(57600, { conn: env.assetChainId }),
        };

        const res = await swapStorage.finalize(traceId, payload);
        console.log('ticket.finalize', res);
        const swap = await swapStorage.read(traceId);

        return {
          swapId: traceId,
          receiver: wallet.address,
          ...swap,
        };
      } catch (err) {
        console.error(err);
        throw new Error('门票创建失败，请重试');
      }
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    console.log('ticket.onUserSetup', { userDid, token, claims });
    return {};
  },
};
