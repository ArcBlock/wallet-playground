/* eslint-disable no-console */
/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetRecipient } = require('@arcblock/asset-factory');

const env = require('../../libs/env');
const { swapStorage, wallet, factory } = require('../../libs/auth');

const ensureAssets = async (userPk, userDid) => {
  const [asset1] = await factory.createBadge({
    backgroundUrl: '',
    data: {
      name: 'Atomic Swap 尝鲜 ②-①',
      description: '完成 Atomic Swap 的通证兑换多个 Badge 测试',
      reason: '完成 Atomic Swap 测试',
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

  const [asset2] = await factory.createBadge({
    backgroundUrl: '',
    data: {
      name: 'Atomic Swap 尝鲜 ②-②',
      description: '完成 Atomic Swap 的通证兑换多个 Badge 测试',
      reason: '完成 Atomic Swap 测试',
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

  return [asset1, asset2];
};

module.exports = {
  action: 'swap-badges',
  claims: {
    swap: async ({ userDid, userPk, extraParams: { traceId } }) => {
      try {
        const [asset1, asset2] = await ensureAssets(userPk, userDid);
        const payload = {
          offerAssets: [asset1.address, asset2.address],
          offerToken: (await ForgeSDK.fromTokenToUnit(0, { conn: env.chainId })).toString(),
          offerUserAddress: wallet.address, // 卖家地址
          demandAssets: [],
          demandToken: (await ForgeSDK.fromTokenToUnit(1.99, { conn: env.assetChainId })).toString(),
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
        throw new Error('徽章创建失败，请重试');
      }
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    return {};
  },
};
