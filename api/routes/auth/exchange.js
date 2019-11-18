/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetRecipient } = require('@arcblock/asset-factory');
const lodash = require('lodash');

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

const getReceives = async (type, count = 1, userPk, userDid) => {
  switch (lodash.toLower(type)) {
    case 'asset': {
      const receiveAssets = [];
      for (let i = 0; i < count; i += 1) {
        receiveAssets.push((await ensureAsset(userPk, userDid)).address); // eslint-disable-line
      }

      return receiveAssets;
    }
    case 'token':
      return ForgeSDK.fromTokenToUnit(count);
    default:
      throw new Error(`Invalid receive type: ${type}`);
  }
};

const getPays = async (type, count = 1, userDid) => {
  switch (lodash.toLower(type)) {
    case 'asset': {
      const assets = await getTransferrableAssets(userDid, count);
      return assets.map(x => x.address);
    }
    case 'token':
      return ForgeSDK.fromTokenToUnit(count);
    default:
      throw new Error(`Invalid pay type: ${type}`);
  }
};

module.exports = {
  action: 'exchange',
  claims: {
    signature: async ({
      userPk,
      userDid,
      extraParams: { receiveType, receiveCount, payType, payCount },
    }) => {
      const receives = await getReceives(receiveType, receiveCount, userPk);

      console.log('RECEIVES:');
      console.log(receives);

      const payAssets = await getPays(payType, payCount, userDid);
      console.log('PAYS:');
      console.log(payAssets);

      const receiverType = receiveType === 'asset' ? 'assets' : 'value';
      const senderType = payType === 'asset' ? 'assets' : 'value';
      const tx = await ForgeSDK.signExchangeTx({
        tx: {
          itx: {
            to: userDid,
            sender: {
              [receiverType]: receives,
            },
            receiver: {
              [senderType]: payAssets,
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
