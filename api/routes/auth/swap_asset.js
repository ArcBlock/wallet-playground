/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');

const env = require('../../libs/env');
const { swapStorage, wallet, foreignFactory, localFactory } = require('../../libs/auth');
const { getTransferrableAssets, ensureAsset } = require('../../libs/util');

// pfc => pay from chain
module.exports = {
  action: 'swap_asset',
  claims: {
    swap: async ({ userDid, userPk, extraParams: { tid, pfc, action, type, name, price, desc, bg, logo } }) => {
      if (Number(price) <= 0) {
        throw new Error('Cannot buy/sell foreign asset without a valid price');
      }

      if (!name) {
        throw new Error('Cannot buy/sell foreign asset without a valid name');
      }

      if (['local', 'foreign'].includes(pfc)) {
        throw new Error('Invalid pay from chain param');
      }

      const assetFactory = pfc === 'local' ? foreignFactory : localFactory;

      if (action === 'buy') {
        try {
          const offerChain = pfc === 'local' ? env.assetChainId : env.chainId;
          const demandChain = pfc === 'local' ? env.chainId : env.assetChainId;

          const asset = await ensureAsset(assetFactory, {
            userPk,
            userDid,
            type,
            name,
            description: desc,
            backgroundUrl: bg,
            logoUrl: logo,
          });

          const payload = {
            offerAssets: [asset.address],
            offerToken: (await ForgeSDK.fromTokenToUnit(0, { conn: offerChain })).toString(),
            offerUserAddress: wallet.address, // 卖家地址
            demandAssets: [],
            demandToken: (await ForgeSDK.fromTokenToUnit(price, { conn: demandChain })).toString(),
            demandUserAddress: userDid, // 买家地址
            demandLocktime: await ForgeSDK.toLocktime(600, { conn: demandChain }),
          };

          const res = await swapStorage.finalize(tid, payload);
          console.log(`${type}.buy.finalize`, res);
          const swap = await swapStorage.read(tid);

          return {
            swapId: tid,
            receiver: wallet.address,
            ...swap,
          };
        } catch (err) {
          console.error('asset create failed', err);
          throw new Error('asset create failed');
        }
      }

      if (action === 'sell') {
        const offerChain = pfc === 'local' ? env.chainId : env.assetChainId;
        const demandChain = pfc === 'local' ? env.assetChainId : env.chainId;

        const assets = await getTransferrableAssets(userDid);
        const asset = assets.find(x => x.moniker === name);

        if (!asset) {
          throw new Error(`No ${type} to sell`);
        }

        // Since we are doing swap with reversed chain
        const payload = {
          offerChainId: offerChain,
          offerChainHost: env.assetChainHost,
          offerAssets: [],
          offerToken: (await ForgeSDK.fromTokenToUnit(price, { conn: offerChain })).toString(),
          offerUserAddress: wallet.address, // 卖家地址

          demandChainId: demandChain,
          demandChainHost: env.chainHost,
          demandAssets: [asset.address],
          demandToken: (await ForgeSDK.fromTokenToUnit(0, { conn: demandChain })).toString(),
          demandUserAddress: userDid, // 买家地址
          demandLocktime: await ForgeSDK.toLocktime(600, { conn: demandChain }),
        };

        const res = await swapStorage.finalize(tid, payload);
        console.log(`${type}.sell.from.${pfc}.finalize`, res);
        const swap = await swapStorage.read(tid);

        return {
          swapId: tid,
          receiver: wallet.address,
          ...swap,
        };
      }

      throw new Error(`Unsupported ${type} action ${action}`);
    },
  },

  onAuth: async ({ claims, userDid, extraParams: { action, type, pfc } }) => {
    console.log(`${type}.${action}.from.${pfc}.onAuth`, { userDid, claims });
  },
};
