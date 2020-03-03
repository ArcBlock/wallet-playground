/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetType } = require('@arcblock/asset-factory');
const { wallet } = require('../../libs/auth');
const { PFC } = require('../../libs/constant');
const env = require('../../libs/env');

const app = ForgeSDK.Wallet.fromJSON(wallet);

const getChainConnection = pfc => (pfc === PFC.local ? env.chainId : env.assetChainId);

const findAssetByType = async ({ userDid, conn, type }) => {
  if (AssetType[type] === undefined) {
    throw new Error('Invalid asset type');
  }

  const { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid }, { conn });

  const asset = assets.find(x => {
    if (x.data.value && x.data.typeUrl === 'json') {
      const value = JSON.parse(x.data.value);
      return value.type === AssetType[type] && x.consumedTime === '';
    }

    return false;
  });

  if (!asset) {
    throw new Error(`You have not purchased any ${type} yet or all ${type}s are consumed!`);
  }

  return asset;
};

const findAssetByTypeUrl = async ({ userDid, conn, tu }) => {
  const { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid }, { conn });

  const asset = assets.find(x => x.data.typeUrl === tu && x.consumedTime === '');

  if (!asset) {
    throw new Error('No matching asset found');
  }

  return asset;
};

/**
 * pfc => pay from chain
 * tu => typeUrl
 */
module.exports = {
  action: 'consume_asset',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { type, pfc, tu = '' } }) => {
      if (!PFC[pfc]) {
        throw new Error('Invalid pay from chain param');
      }

      const conn = getChainConnection(pfc);

      let asset = null;
      if (tu) {
        asset = await findAssetByTypeUrl({ userDid, conn, tu });
      } else {
        asset = await findAssetByType({ userDid, conn, type });
      }

      console.log(`about to consume ${type}`, asset);
      const tx = await ForgeSDK.signConsumeAssetTx(
        {
          tx: { itx: { issuer: wallet.address, address: asset.address } },
          wallet: app,
        },
        { conn }
      );

      tx.signaturesList = [
        {
          pk: userPk,
          signer: userDid,
          delegator: '',
          data: {
            typeUrl: 'fg:x:address',
            value: Uint8Array.from(Buffer.from(asset.address)),
          },
        },
      ];

      return {
        type: 'ConsumeAssetTx',
        data: tx,
        description: `Sign this transaction to confirm the ${type} consumption`,
      };
    },
  },
  onAuth: async ({ claims, userDid, extraParams: { pfc } }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      console.log('consume_asset.auth.claim', claim);

      const tx = ForgeSDK.decodeTx(claim.origin);
      const signer = tx.signaturesList.find(x => x.signer === userDid);
      if (!signer) {
        throw new Error('Multisig is invalid');
      }

      signer.signature = claim.sig;
      console.log('consume_asset.auth.tx', tx);
      const hash = await ForgeSDK.sendConsumeAssetTx({ tx, wallet: app }, { conn: getChainConnection(pfc) });
      console.log('hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      console.log(err.errors);
      throw err;
    }
  },
};
