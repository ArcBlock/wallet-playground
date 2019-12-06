/* eslint-disable no-console */
/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetRecipient } = require('@arcblock/asset-factory');

const env = require('../../libs/env');
const { swapStorage, wallet, factory } = require('../../libs/auth');
const { getTransferrableAssets } = require('../../libs/util');

const ensureAsset = async (userPk, userDid) => {
  const [asset] = await factory.createCertificate({
    backgroundUrl: '',
    data: {
      name: 'DevCon0 黑客松人气奖',
      description: '兹证明你的黑客松作品《基于 Forge 的共享充电桩应用》被观众评选为全场最佳人气奖',
      reason: '所有 DevCon0 黑客松参赛者评选出来的最高人气奖',
      logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
      issueTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
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
  action: 'swap-certificate',
  claims: {
    swap: async ({ userDid, userPk, extraParams: { traceId, action } }) => {
      if (action === 'buy') {
        try {
          const asset = await ensureAsset(userPk, userDid);
          const payload = {
            offerAssets: [asset.address],
            offerToken: (await ForgeSDK.fromTokenToUnit(0, { conn: env.chainId })).toString(),
            offerUserAddress: wallet.address, // 卖家地址
            demandAssets: [],
            demandToken: (await ForgeSDK.fromTokenToUnit(6.99, { conn: env.assetChainId })).toString(),
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
          throw new Error('证书创建失败，请重试');
        }
      }

      if (action === 'sell') {
        const assets = await getTransferrableAssets(userDid);
        const asset = assets.find(x => x.moniker === 'DevCon0 黑客松人气奖');

        if (!asset) {
          throw new Error('No certificate to sell');
        }

        // Since we are doing swap with reversed chain
        const payload = {
          offerChainId: env.assetChainId,
          offerChainHost: env.assetChainHost,
          offerAssets: [],
          offerToken: (await ForgeSDK.fromTokenToUnit(6.99, { conn: env.assetChainId })).toString(),
          offerUserAddress: wallet.address, // 卖家地址

          demandChainId: env.chainId,
          demandChainHost: env.chainHost,
          demandAssets: [asset.address],
          demandToken: (await ForgeSDK.fromTokenToUnit(0, { conn: env.chainId })).toString(),
          demandUserAddress: userDid, // 买家地址
          demandLocktime: await ForgeSDK.toLocktime(2400, { conn: env.chainId }),
        };

        const res = await swapStorage.finalize(traceId, payload);
        console.log('certificate.sell.finalize', res);
        const swap = await swapStorage.read(traceId);

        return {
          swapId: traceId,
          receiver: wallet.address,
          ...swap,
        };
      }

      throw new Error(`Unsupported certificate action ${action}`);
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    console.log('swap.certificate.onAuth', { userDid, token, claims });
    return {};
  },
};
