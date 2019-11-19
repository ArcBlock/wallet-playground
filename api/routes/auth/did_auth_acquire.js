/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toAssetAddress } = require('@arcblock/did-util');
const { decodeAny } = require('@arcblock/forge-message/lite');
const { fromAddress } = require('@arcblock/forge-wallet');

module.exports = {
  action: 'did_auth_acquire',
  claims: {
    signature: async ({ userPk, userDid }) => {
      const factoryAddress = 'zjddV5Q7q2LBsWHrwTns91o6EkRvjYaTxm6z';

      const { state } = await ForgeSDK.getAssetState({ address: factoryAddress });
      if (!state) {
        throw new Error('Asset factory address does not exist on chain');
      }

      const decoded = decodeAny(state.data);
      if (!decoded) {
        throw new Error('Asset factory state cannot be decoded');
      }

      const factory = decoded.value;

      const assetVariables = [
        {
          cinema: '万达影院',
          name: '阿甘正传',
          location: '朝阳区',
          row: '6',
          seat: '6',
          datetime: '2019-11-25 09:00',
        },
      ];

      const assets = assetVariables.map(x => {
        const payload = {
          readonly: true,
          transferrable: factory.attributes.transferrable,
          ttl: factory.attributes.ttl,
          parent: factoryAddress,
          data: {
            type: factory.assetName,
            value: x,
          },
        };

        const address = toAssetAddress(payload);

        return { address, data: JSON.stringify(x) };
      });

      const data = {
        from: userDid,
        itx: {
          to: factoryAddress,
          specs: assets,
        },
        pk: userPk,
      };

      return {
        type: 'AcquireAssetTx',
        data,
      };
    },
  },
  onAuth: async ({ claims, userDid }) => {
    const claim = claims.find(x => x.type === 'signature');
    console.log('did_auth_acquire.auth.claim', claim);

    const tx = ForgeSDK.decodeTx(claim.origin);
    tx.signature = claim.sig;

    console.log('did_auth_acquire.auth.tx', tx);
    const hash = await ForgeSDK.sendAcquireAssetTx({ tx, wallet: fromAddress(userDid) });
    console.log('hash:', hash);
    return { hash, tx: claim.origin };
  },
};
