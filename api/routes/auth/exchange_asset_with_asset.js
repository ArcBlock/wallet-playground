/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetRecipient } = require('@arcblock/asset-factory');

const { factory, wallet } = require('../../libs/auth');
const { getTransferrableAssets } = require('../../libs/util');

const ensureAsset = async (userPk, userDid) => {
  const [asset] = await factory.createCertificate({
    backgroundUrl: '',
    data: {
      name: 'Asset&Asset普通话一级甲等证书',
      description: '普通话一级甲等证书',
      reason: '普通话标准',
      logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
      issueTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
      expireTime: -1,
      recipient: new AssetRecipient({
        wallet: ForgeSDK.Wallet.fromPublicKey(userPk),
        name: userDid,
        location: '北京市',
      }),
    },
  });

  return asset;
};

module.exports = {
  action: 'exchange_asset_with_asset',
  claims: {
    signature: async ({ userPk, userDid }) => {
      const dAppAsset = await ensureAsset(userPk, userDid);
      const [asset] = await getTransferrableAssets(userDid);
      const tx = await ForgeSDK.signExchangeTx({
        tx: {
          itx: {
            to: userDid,
            sender: {
              assets: [dAppAsset.address],
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
        description: 'Asset & Asset',
      };
    },
  },
  onAuth: async ({ claims }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      console.log('exchange.auth.claim', claim);

      const tx = ForgeSDK.decodeTx(claim.origin);

      tx.signaturesList[0].signature = claim.sig;

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
