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
  });

  console.log('createAsset.done', hash);

  return asset;
};

module.exports = {
  action: 'swap',
  claims: {
    swap: async ({ userDid, extraParams: { traceId } }) => {
      const asset = await ensureAsset(userDid);
      const updates = {
        offerDid: wallet.address,
        offerAssets: [asset.address],
        offerToken: '0',
        demandAssets: [],
        demandToken: ForgeSDK.Util.fromTokenToUnit(1).toString(), // FIXME: decimal
        demandDid: userDid,
      };

      await swapStorage.update(traceId, updates);
      const swap = await swapStorage.read(traceId);
      console.log('swap.prepare', swap);

      return {
        swapId: traceId,
        receiver: wallet.address,
        ...swap,
      };
    },
  },

  onAuth: async ({ claims, userDid, token, storage }) => {
    console.log(claims);
  },
};
