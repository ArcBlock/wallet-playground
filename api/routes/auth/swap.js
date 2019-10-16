/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');
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
      const asset = await ensureAsset(userDid);
      const payload = {
        offerAssets: [asset.address],
        offerToken: '0',
        offerAddress: wallet.address, // 卖家地址
        demandAssets: [],
        demandToken: ForgeSDK.Util.fromTokenToUnit(1).toString(), // FIXME: decimal
        demandAddress: userDid, // 买家地址
      };

      await swapStorage.finalizePayload(traceId, payload);
      const swap = await swapStorage.read(traceId);
      console.log('swap.prepare', swap);

      return {
        swapId: traceId,
        receiver: wallet.address,
        ...swap,
      };
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ claims, userDid, token }) => {
    console.log('swap.onUserSetup', { userDid, token, claims });
    return {};
  },
};
