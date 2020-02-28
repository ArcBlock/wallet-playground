/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetType } = require('@arcblock/asset-factory');

const { wallet, localFactory: assetFactory } = require('../../libs/auth');
const { ensureAsset, getTransferrableAssets } = require('../../libs/util');

const getAssets = async ({ amount = 1, type, userPk, userDid, name, desc, start, end, bg, logo, loc }) => {
  const tasks = [];
  for (let i = 0; i < amount; i += 1) {
    tasks.push(
      ensureAsset(assetFactory, {
        userPk,
        userDid,
        type,
        name,
        description: desc || name,
        location: loc || 'China',
        backgroundUrl: bg || '',
        logoUrl: logo || 'https://releases.arcblockio.cn/arcblock-logo.png',
        startTime: start || new Date(),
        endTime: end || new Date(Date.now() + 2 * 60 * 60 * 1000),
      })
    );
  }

  const assets = await Promise.all(tasks);
  return assets.map(item => item.address);
};

const getTransactionAssetType = type => (type === 'token' ? 'value' : 'assets');

module.exports = {
  action: 'exchange_assets',
  claims: {
    signature: async ({
      userPk,
      userDid,
      extraParams: { payAmount, payType, receiveAmount, receiveType, name, desc, start, end, bg, logo, loc },
    }) => {
      if (!name) {
        throw new Error('Cannot buy/sell asset without a valid name');
      }

      if (payType !== 'token' && AssetType[payType] === undefined) {
        throw new Error(`Invalid asset type: ${payType}`);
      }

      if (receiveType !== 'token' && AssetType[receiveType] === undefined) {
        throw new Error(`Invalid asset type: ${receiveType}`);
      }

      let payAssets = null;
      let receiveAssets = null;

      if (payType === 'token') {
        payAssets = await ForgeSDK.fromTokenToUnit(payAmount);
      } else {
        const assets = await getTransferrableAssets(userDid);
        payAssets = assets
          .filter(item => JSON.parse(item.data.value).type === AssetType[payType])
          .map(item => item.address)
          .slice(0, payAmount);

        if (payAssets.length < payAmount) {
          throw new Error('Not sufficient Assets');
        }
      }

      if (receiveType === 'token') {
        receiveAssets = await ForgeSDK.fromTokenToUnit(payAmount);
      } else {
        receiveAssets = await getAssets({
          amount: receiveAmount,
          type: receiveType,
          userPk,
          userDid,
          name,
          desc,
          start,
          end,
          bg,
          logo,
          loc,
        });
      }

      const tx = await ForgeSDK.signExchangeTx({
        tx: {
          itx: {
            to: userDid,
            sender: {
              [getTransactionAssetType(receiveType)]: receiveAssets,
            },
            receiver: {
              [getTransactionAssetType(payType)]: payAssets,
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
        type: 'AcquireAssetTx',
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
