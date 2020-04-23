/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const ForgeWallet = require('@arcblock/forge-wallet');
const { create } = require('@arcblock/vc');
const { toTypeInfo } = require('@arcblock/did');

const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');

const w = ForgeWallet.fromJSON(wallet);
const badgeArray = require('../../libs/svg');

const ensureAsset = async userDid => {
  const index = Math.floor(Math.random() * 10 + 1);
  const svg = badgeArray[index];
  const vc = create({
    type: '',
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
  const asset = {
    moniker: `badge-svg-${index}`,
    readonly: true,
    transferrable: true,
    data: {
      typeUrl: 'vc',
      value: vc,
    },
  };
  asset.address = ForgeSDK.Util.toAssetAddress(asset);
  const hash = await ForgeSDK.sendCreateAssetTx({
    tx: { itx: asset },
    wallet: w,
  });
  return [asset, hash];
};

module.exports = {
  action: 'issue_badge_asset',
  claims: {
    signature: async ({ userDid }) => {
      const [asset] = await ensureAsset(userDid);
      return {
        description: '签名该文本，你将获得如下徽章',
        data: getRandomMessage(),
        type: 'mime:text/plain',
        meta: {
          asset: asset.address,
        },
        display: JSON.stringify(asset.data.value.credentialSubject.display),
      };
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    try {
      logger.info('transfer_asset_in.onAuth', { claims, userDid });
      const type = toTypeInfo(userDid);
      const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('签名错误');
      }

      const appWallet = ForgeSDK.Wallet.fromJSON(wallet);
      const hash = await ForgeSDK.sendTransferTx({
        tx: {
          itx: {
            to: userDid,
            assets: [claim.meta.asset],
          },
        },
        wallet: appWallet,
      });

      logger.info('transfer_asset_in.onAuth', hash);
      return { hash };
    } catch (err) {
      logger.info('transfer_asset_in.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
