/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');
const { AssetRecipient } = require('@arcblock/asset-factory');

const { wallet, factory } = require('../../libs/auth');

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
  action: 'transfer_asset_in',
  claims: {
    signature: async ({ userPk, userDid }) => {
      const asset = await ensureAsset(userPk, userDid);

      return {
        description: `签名该文本，你将获得 asset ${asset.address}`,
        data: JSON.stringify({ asset: asset.address, userDid }, null, 2),
        type: 'mime::text/plain',
      };
    },
  },
  onAuth: async ({ claims, userDid, userPk }) => {
    try {
      console.log('transfer_asset_in.onAuth', { claims, userDid });
      const type = toTypeInfo(userDid);
      const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('签名错误');
      }

      const appWallet = ForgeSDK.Wallet.fromJSON(wallet);
      const data = JSON.parse(ForgeSDK.Util.fromBase58(claim.data));
      const hash = await ForgeSDK.sendTransferTx({
        tx: {
          itx: {
            to: data.userDid,
            assets: [data.asset],
          },
        },
        wallet: appWallet,
      });

      console.log('transfer_asset_in.onAuth', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      console.log('transfer_asset_in.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
