/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');

const app = ForgeSDK.Wallet.fromJSON(wallet);

module.exports = {
  action: 'consume_asset',
  claims: {
    signature: async ({ userDid, userPk }) => {
      const { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid });
      const [ticket] = assets.filter(
        x => x.data.typeUrl === 'fg:x:movie_ticket' && x.consumedTime === ''
      );
      if (!ticket) {
        throw new Error('You have not purchased any movie ticket yet or all tickets are consumed!');
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
        description: 'Sign this transaction to confirm the movie ticket consumption',
      };
    },
  },
  onAuth: async ({ claims, userDid }) => {
    const claim = claims.find(x => x.type === 'signature');
    console.log('consume_ticket.auth.claim', claim);

    const tx = ForgeSDK.decodeTx(claim.origin);
    const signer = tx.signaturesList.find(x => x.signer === userDid);
    if (signer) {
      signer.signature = claim.sig;
    }

    try {
      console.log('consume_ticket.auth.tx', tx);
      const hash = await ForgeSDK.sendConsumeAssetTx({ tx, wallet: app });
      console.log('hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      console.log(err.errors);
      throw err;
    }
  },
};
