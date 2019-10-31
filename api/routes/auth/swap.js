/* eslint-disable no-console */
/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetRecipient } = require('@arcblock/asset-factory');

const env = require('../../libs/env');
const { swapStorage, wallet, factory } = require('../../libs/auth');

const ensureAsset = async (userPk, userDid) => {
  const [asset] = await factory.createBadge({
    backgroundUrl: '',
    data: {
      name: 'Atomic Swap 尝鲜 ①',
      description: '完成 Atomic Swap 的通证兑换 Badge 测试',
      reason: '报名并现场参加了 ArcBlock 的 DevCon0',
      logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
      issueTime: Date.now(),
      expireTime: -1,
      recipient: new AssetRecipient({
        wallet: ForgeSDK.Wallet.fromPublicKey(userPk),
        name: userDid,
        location: '北京市朝阳区',
      }),
    },
  });

  return asset;
};

module.exports = {
  action: 'swap',
  claims: {
    swap: async ({ userDid, userPk, extraParams: { traceId } }) => {
      try {
        const asset = await ensureAsset(userPk, userDid);
        const payload = {
          offerAssets: [asset.address],
          offerToken: (await ForgeSDK.fromTokenToUnit(0, { conn: env.chainId })).toString(),
          offerUserAddress: wallet.address, // 卖家地址
          demandAssets: [],
          demandToken: (await ForgeSDK.fromTokenToUnit(1, { conn: env.assetChainId })).toString(),
          demandUserAddress: userDid, // 买家地址
          demandLocktime: await ForgeSDK.toLocktime(57600, { conn: env.assetChainId }),
        };

        const res = await swapStorage.finalize(traceId, payload);
        console.log('swap.finalize', res);
        const swap = await swapStorage.read(traceId);

        return {
          swapId: traceId,
          receiver: wallet.address,
          ...swap,
        };
      } catch (err) {
        console.error(err);
        throw new Error('徽章创建失败失败，请重试');
      }
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    console.log('swap.onUserSetup', { userDid, token, claims });
    return {};
  },
};
