/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetRecipient } = require('@arcblock/asset-factory');

const { factory, wallet } = require('../../libs/auth');
const { getTransferrableAssets } = require('../../libs/util');

const ensureAsset = async (userPk, userDid) => {
  const now = new Date();
  const [asset] = await factory.createCertificate({
    backgroundUrl: '',
    data: {
      name: `Asset&Asset 普通话一级证书 ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
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
    signature: async ({ userPk, userDid, extraParams: { receiveCount = 1, payCount = 1 } }) => {
      const receiveAssets = [];

      for (let i = 0; i < receiveCount; i += 1) {
        receiveAssets.push((await ensureAsset(userPk, userDid)).address); // eslint-disable-line
      }

      console.log('RECEIVE ASSETS:');
      console.log(receiveAssets);

      const payAssets = await getTransferrableAssets(userDid, payCount);
      console.log('PAY ASSETS:');
      console.log(payAssets);

      const tx = await ForgeSDK.signExchangeTx({
        tx: {
          itx: {
            to: userDid,
            sender: {
              assets: receiveAssets,
            },
            receiver: {
              assets: payAssets.map(x => x.address),
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
