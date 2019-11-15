/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');

const { wallet } = require('../../libs/auth');
const { getTransferrableAssets } = require('../../libs/util');

module.exports = {
  action: 'exchange_token_with_asset',
  claims: {
    signature: async ({ userPk, userDid }) => {
      const [asset] = await getTransferrableAssets(userDid);
      const tx = await ForgeSDK.signExchangeTx({
        tx: {
          itx: {
            to: userDid,
            sender: {
              value: await ForgeSDK.fromTokenToUnit(1),
            },
            receiver: {
              assets: [asset.address],
            },
          },
        },
        wallet: ForgeSDK.Wallet.fromJSON(wallet),
      });

      tx.signaturesList.push({
        pk: ForgeSDK.Util.fromBase58(userPk),
        signer: userDid,
      });

      console.log('exchange.claims.signed', tx);

      return {
        type: 'ExchangeTx',
        data: tx,
        description: 'test',
      };
    },
  },
  onAuth: async ({ claims }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      console.log('exchange.auth.claim', claim);

      const tx = ForgeSDK.decodeTx(claim.origin);

      tx.signaturesList[0].signature = claim.sig;
      console.log('exchange.auth.tx', tx);

      const hash = await ForgeSDK.exchange({
        tx,
        wallet: ForgeSDK.Wallet.fromJSON(wallet),
      });

      console.log('exchange tx hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      throw new Error(`Exchange failed: ${err.message}`);
    }
  },
};
