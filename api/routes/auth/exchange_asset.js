/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { AssetType } = require('@arcblock/asset-factory');
const { toTypeInfo } = require('@arcblock/did');
const upperFirst = require('lodash/upperFirst');

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

const getTransferSig = async ({ userPk, userDid, ra, rt, name, desc, start, end, bg, logo, loc, locale = 'en' }) => {
  const [assetAddress] = await getAssets({
    amount: ra,
    type: rt,
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

  const description = {
    en: `Sign this text to get ${upperFirst(rt)} asset`,
    zh: `签名该文本，你将获得 ${upperFirst(rt)} 资产`,
  };

  return {
    description: description[locale],
    data: JSON.stringify({ asset: assetAddress, userDid }, null, 2),
    type: 'mime:text/plain',
  };
};

const getExchangeSig = async ({ userPk, userDid, pa, pt, ra, rt, name, desc, start, end, bg, logo, loc }) => {
  let senderPayload = null;
  let receiverPayload = null;

  if (pt === 'token') {
    senderPayload = await ForgeSDK.fromTokenToUnit(pa);
  } else {
    const assets = await getTransferrableAssets(userDid);
    senderPayload = assets
      .filter(item => JSON.parse(item.data.value).type === AssetType[pt])
      .map(item => item.address)
      .slice(0, pa);

    if (senderPayload.length < pa) {
      throw new Error('Not sufficient Assets');
    }
  }

  if (rt === 'token') {
    receiverPayload = await ForgeSDK.fromTokenToUnit(ra);
  } else {
    receiverPayload = await getAssets({
      amount: ra,
      type: rt,
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
          [getTransactionAssetType(rt)]: receiverPayload,
        },
        receiver: {
          [getTransactionAssetType(pt)]: senderPayload,
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
};

const transferAsset = async ({ claim, userDid, userPk }) => {
  try {
    console.log('exchange_asset.onAuth', { claim, userDid });
    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);

    if (user.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }

    const appWallet = ForgeSDK.Wallet.fromJSON(wallet);
    const data = JSON.parse(ForgeSDK.Util.fromBase58(claim.origin));
    const hash = await ForgeSDK.sendTransferTx({
      tx: {
        itx: {
          to: data.userDid,
          assets: [data.asset],
        },
      },
      wallet: appWallet,
    });

    console.log('exchange_asset.onAuth', hash);
    return { hash, tx: claim.origin };
  } catch (err) {
    console.log('exchange_asset.onAuth.error', err);
    throw new Error('交易失败', err.message);
  }
};

const exchangeAsset = async claim => {
  const tx = ForgeSDK.decodeTx(claim.origin);

  tx.signaturesList[0].signature = claim.sig;

  const hash = await ForgeSDK.exchange({
    tx,
    wallet: ForgeSDK.Wallet.fromJSON(wallet),
  });

  console.log('exchange tx hash:', hash);
  return { hash, tx: claim.origin };
};

/**
 * pa => pay amount
 * pt => pay type
 * ra => receive amount
 * rt => receive type
 */
module.exports = {
  action: 'exchange_assets',
  claims: {
    signature: async ({
      userPk,
      userDid,
      extraParams: { pa = 1, pt, ra = 1, rt, name, desc, start, end, bg, logo, loc, locale = 'en' },
    }) => {
      if (!name) {
        throw new Error('Cannot buy/sell asset without a valid name');
      }

      if (pt !== 'token' && AssetType[pt] === undefined) {
        throw new Error(`Invalid asset type: ${pt}`);
      }

      if (rt !== 'token' && AssetType[rt] === undefined) {
        throw new Error(`Invalid asset type: ${rt}`);
      }

      try {
        if (pt === 'token' && Number(pa) === 0) {
          const sig = await getTransferSig({ userPk, userDid, ra, rt, name, desc, start, end, bg, logo, loc, locale });
          return sig;
        }

        const sig = await getExchangeSig({ userPk, userDid, pa, pt, ra, rt, name, desc, start, end, bg, logo, loc });
        return sig;
      } catch (error) {
        console.log('exchange_asset.generate_exchange.error:');
        console.log(error);

        throw new Error(`Exchange failed: ${error.message}`);
      }
    },
  },
  onAuth: async ({ claims, userDid, userPk }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      console.log('exchange.auth.claim', claim);

      if (claim.typeUrl === 'mime:text/plain') {
        const tx = await transferAsset({ claim, userDid, userPk });
        return tx;
      }

      const tx = await exchangeAsset(claim);
      return tx;
    } catch (err) {
      console.log('exchange_asset.error:');
      console.log(err);

      throw new Error(`Exchange failed: ${err.message}`);
    }
  },
};
