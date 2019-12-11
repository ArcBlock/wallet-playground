/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');

module.exports = {
  action: 'claim_target',

  authPrincipal: {
    description: 'Please select the required DID',
    target: 'z1hD4gEPyPgvpPm8UfsWCVttwQV2C7m8uf9',
  },

  claims: {
    signature: async ({ userDid, userPk }) => {
      const params = {
        type: 'mime::text/plain',
        data: JSON.stringify({ userDid, userPk }, null, 2),
      };

      return Object.assign({ description: 'Please sign the text to prove that you own the did' }, params);
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    console.log('claim.create_did.onAuth', { userPk, userDid });

    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    if (user.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }

    return '签名验证成功';
  },
};
