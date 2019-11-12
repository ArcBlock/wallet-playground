/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { fromAddress } = require('@arcblock/forge-wallet');
const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');

module.exports = {
  action: 'transfer_asset_out',
  claims: {
    signature: async ({ userDid }) => {
      const { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid });
      if (!assets || assets.length === 0) {
        throw new Error('You do not have any asset, use other test to earn one');
      }

      const asset = assets.find(x => x.transferrable);
      if (!asset) {
        throw new Error('You do not have any asset that can be transferred to me');
      }

      return {
        type: 'TransferTx',
        data: {
          itx: {
            to: wallet.address,
            assets: [asset.address],
          },
        },
        description: `Please transfer asset ${asset.address} to me`,
      };
    },
  },
  onAuth: async ({ claims, userDid, extraParams: { locale } }) => {
    console.log('transfer_asset_out.onAuth', { claims, userDid });
    try {
      const claim = claims.find(x => x.type === 'signature');
      const tx = ForgeSDK.decodeTx(claim.origin);
      const user = fromAddress(userDid);

      const hash = await ForgeSDK.sendTransferTx(
        {
          tx,
          wallet: user,
          signature: claim.sig,
        },
        { conn: env.chainId }
      );

      console.log('transfer_asset_out.onAuth', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      console.log('transfer_asset_out.onAuth.error', err);
      const errors = {
        en: 'Payment failed!',
        zh: '支付失败',
      };
      throw new Error(errors[locale] || errors.en);
    }
  },
};
