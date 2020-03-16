/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const ForgeWallet = require('@arcblock/forge-wallet');
const { create } = require('@arcblock/vc');
const { toTypeInfo } = require('@arcblock/did');


const { wallet } = require('../../libs/auth');

const w = ForgeWallet.fromJSON(wallet);
const badgeArray = require('../../libs/svg');


const ensureAsset = async (userPk, userDid) => {
  const badgeIndex = Math.floor(Math.random() * 10);
  const svg = badgeArray[badgeIndex];

  const vc = create({
    type: 'WalletPlaygroundAchievement',
    issuer: {
      wallet: w,
      name: 'ArcBlock.Badge',
    },
    subject: {
      id: userDid,
      name: 'Wallet Playground Completion',
      description: 'Master of Cross Border Money Transfer',
      display: {
        type: 'svg_gzipped',
        content: svg,
      },
    },
  });

  const asset = Object.assign({
    moniker: `badge-svg-${badgeIndex}`,
    readonly: true,
    transferrable: true,
    data: {
      typeUrl: 'vc',
      value: [vc],
    },
  });
  asset.address = ForgeSDK.Util.toAssetAddress(asset);
  const hash = await ForgeSDK.sendCreateAssetTx(
    {
      tx: { itx: asset },
      wallet: w,
    }
  );
  return [asset, hash];
};

module.exports = {
  action: 'issue_badge_asset',
  claims: {
    signature: async ({ userDid, userPk }) => {
      const [asset] = await ensureAsset(userPk, userDid);
      return {
        description: `签名该文本，你将获得 asset ${asset.address}`,
        data: JSON.stringify({ asset: asset.address, userDid }, null, 2),
        type: 'mime:text/plain',
      };
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    try {
      console.log('transfer_asset_in.onAuth', { claims, userDid });
      const type = toTypeInfo(userDid);
      const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

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

      console.log('transfer_asset_in.onAuth', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      console.log('transfer_asset_in.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
