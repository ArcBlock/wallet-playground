/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetType } = require('@arcblock/asset-factory');
const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');

const app = ForgeSDK.Wallet.fromJSON(wallet);

module.exports = {
  action: 'consume_asset',
  claims: {
    signature: async ({ userDid, userPk }) => {
      let { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid }, { conn: env.chainId }); // TODO: support both chains

      assets = assets
        .filter(x => x.data.typeUrl === 'json' && x.data.value)
        .map(x => {
          x.data = JSON.parse(x.data.value);
          return x;
        });

      // TODO: support consume any valid asset type
      const [ticket] = assets.filter(x => x.data.type === AssetType.ticket && x.consumedTime === '');
      if (!ticket) {
        throw new Error('You have not purchased any ticket yet or all tickets are consumed!');
      }

      console.log('about to consume ticket', ticket);
      const tx = await ForgeSDK.signConsumeAssetTx(
        {
          tx: { itx: { issuer: wallet.address, address: ticket.address } },
          wallet: app,
        },
        { conn: env.chainId }
      );

      tx.signaturesList = [
        {
          pk: userPk,
          signer: userDid,
          delegator: '',
          data: {
            typeUrl: 'fg:x:address',
            value: Uint8Array.from(Buffer.from(ticket.address)),
          },
        },
      ];

      return {
        type: 'ConsumeAssetTx',
        data: tx,
        description: 'Sign this transaction to confirm the ticket consumption',
      };
    },
  },
  onAuth: async ({ claims, userDid }) => {
    const claim = claims.find(x => x.type === 'signature');
    console.log('consume_asset.auth.claim', claim);

    const tx = ForgeSDK.decodeTx(claim.origin);
    const signer = tx.signaturesList.filter(x => x.signer === userDid);
    if (signer) {
      signer.signature = claim.sig;
    }

    try {
      console.log('consume_asset.auth.tx', tx);
      const hash = await ForgeSDK.sendConsumeAssetTx({ tx, wallet: app });
      console.log('hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      console.log(err.errors);
      console.error(err);
    }
  },
};
