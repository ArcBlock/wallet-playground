/* eslint-disable camelcase */
const ForgeSDK = require('@arcblock/forge-sdk');
const env = require('../../libs/env');
const { swapStorage, wallet, authenticator } = require('../../libs/auth');

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
        offerAddress: userDid,
        demandAssets: [],
        demandToken: ForgeSDK.Util.fromTokenToUnit(1).toString(), // FIXME: decimal
        demandAddress: wallet.address,
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
  onAuth: async ({ claims, userDid, token, extraParams }) => {
    console.log('swap.onUserSetup', { userDid, token, claims });
    const { traceId } = extraParams;

    const swap = claims.find(x => x.type === 'swap');
    const { state } = await ForgeSDK.getSwapState({ address: swap.address }, { conn: env.assetChainId });

    // 保存 user setup_swap 到数据库
    const updates = {
      status: 'user_setup',
      demandSetupHash: state.hash,
      demandSwapAddress: swap.address,
    };
    await swapStorage.update(traceId, updates);

    // 把服务端的 swap address 返回给客户端
    const url = authenticator.getPublicUrl('/api/did/swap/retrieve', extraParams);
    console.log('swap.callback', url);
    return { response: { callback: url } };
  },
};
