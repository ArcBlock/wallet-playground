/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { fromTokenToUnit } = require('@arcblock/forge-util');
const { fromAddress, fromJSON } = require('@arcblock/forge-wallet');
const { AssetRecipient } = require('@arcblock/asset-factory');

const { wallet, factory } = require('../../libs/auth');

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

const ensureAsset = async (userPk, userDid) => {
  const [asset] = await factory.createCertificate({
    backgroundUrl: '',
    data: {
      name: '普通话二级甲等证书',
      description: '普通话二级甲等证书',
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
  action: 'exchange_asset_with_token',
  claims: {
    signature: async ({ userPk, userDid }) => {
      // 3. create asset for sender
      const asset = await ensureAsset(userPk, userDid);
      console.log(asset);
      // const user = ForgeSDK.Wallet.fromPublicKey(userPk);
      const exchange = {
        itx: {
          to: userDid,
          sender: {
            assets: [asset.address],
          },
          receiver: {
            // value: fromTokenToUnit(0.01),
            value: await ForgeSDK.fromTokenToUnit(1),
          },
        },
      };

      console.log(exchange);
      // const sender = fromJSON(wallet);
      // const signedTx = await ForgeSDK.signExchangeTx({
      //   tx: exchange,
      //   wallet: sender,
      // });

      // signedTx.signatures = [
      //   {
      //     pk: userPk,
      //     signer: userDid,
      //   },
      // ];

      const sender = fromJSON(wallet);
      const { buffer, object: encoded } = await ForgeSDK.encodeExchangeTx({
        tx: exchange,
        wallet: sender,
      });
      const senderSignature = sender.sign(buffer);
      console.log('certify.onReq.exchange', exchange.itx);
      console.log('certify.onReq.signature', senderSignature);

      // We need to persist from and nonce
      exchange.from = encoded.from;
      exchange.nonce = encoded.nonce;

      exchange.signature = senderSignature;
      exchange.signatures = [
        {
          pk: ForgeSDK.Util.fromBase58(userPk),
          signer: userDid,
        },
      ];

      console.log('EXCHANGE:');
      console.log(exchange);

      return {
        type: 'ExchangeTx',
        data: exchange,
        description: 'test',
      };
    },
  },
  onAuth: async ({ claims }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      const userSignedTx = ForgeSDK.decodeTx(claim.origin);
      console.log('USER SIGNED 1:');
      console.log(userSignedTx);
      userSignedTx.signaturesList[0].signature = claim.sig;
      const dApp = fromJSON(wallet);

      console.log('USER SIGNED2:');
      console.log(userSignedTx);

      const hash = await ForgeSDK.exchange({
        tx: userSignedTx,
        wallet: dApp,
      });

      console.log('exchange tx hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      throw new Error(`Exchange failed: ${err.message}`);
    }
  },
};
