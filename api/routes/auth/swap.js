/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');
const env = require('../../libs/env');
const { swapStorage, wallet } = require('../../libs/auth');

const ensureAsset = async user => {
  const asset = {
    moniker: `asset_for_${user}`,
    readonly: false,
    transferrable: false,
    data: {
      typeUrl: 'json',
      value: {
        user,
        sn: Math.random(),
      },
    },
  };

  const address = ForgeSDK.Util.toAssetAddress(asset);
  asset.address = address;

  // check existence
  const { state } = await ForgeSDK.getAssetState({ address });
  if (state) {
    return asset;
  }

  // create new
  console.log('createAsset.payload', asset);
  const hash = await ForgeSDK.sendCreateAssetTx({
    tx: { itx: asset },
    wallet: ForgeSDK.Wallet.fromJSON(wallet),
    commit: true,
  });

  console.log('createAsset.done', hash);

  return asset;
};

module.exports = {
  action: 'swap',
  claims: {
    swap: async ({ userDid, extraParams: { traceId } }) => {
      try {
        const asset = await ensureAsset(userDid);
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
        throw new Error('出票失败，请重试');
      }
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    console.log('swap.onUserSetup', { userDid, token, claims });
    return {};
  },
};
