/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');

module.exports = {
  action: 'claim_signature',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { type } }) => {
      const params = {
        transaction: {
          type: 'DeclareTx',
          data: {
            itx: { moniker: 'wangshijun' },
          },
        },

        text: {
          type: 'mime::text/plain',
          data: JSON.stringify({ userDid, userPk }, null, 2),
        },

        html: {
          type: 'mime::text/html',
          data: `<div>
  <h2 style="color:red;font-weight:bold;border-bottom:1px solid blue;">This is title</h2>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</div>`,
        },
      };

      if (!params[type]) {
        throw new Error(`Unsupported signature type ${type}`);
      }

      return Object.assign({ description: `Please sign the ${type}` }, params[type]);
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    console.log('claim.signature.onAuth', { userPk, userDid });

    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    if (user.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }

    return '签名验证成功';
  },
};
