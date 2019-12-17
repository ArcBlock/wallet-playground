/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');
const { User } = require('../../models');

module.exports = {
  action: 'claim_target',
  authPrincipal: false, // disable default auth principal
  claims: [
    {
      authPrincipal: async ({ sessionDid }) => {
        const user = await User.findOne({ did: sessionDid });
        if (!user) {
          throw new Error('You are not a valid user, please login and retry');
        }

        user.extraDid = Array.isArray(user.extraDid) ? user.extraDid : [];
        if (!user.extraDid.length) {
          throw new Error("You have not generated any DID that's known to me, please generate one first");
        }

        return {
          description: 'Please select the required DID',
          target: user.extraDid[0],
        };
      },
    },
    {
      signature: async ({ userDid, userPk }) => {
        const params = {
          type: 'mime:text/plain',
          data: JSON.stringify({ userDid, userPk }, null, 2),
        };

        return Object.assign({ description: 'Please sign the text to prove that you own the did' }, params);
      },
    },
  ],

  onAuth: async ({ userDid, userPk, sessionDid, claims }) => {
    const claim = claims.find(x => x.type === 'signature');
    console.log('claim.create_did.onAuth', { userPk, userDid, claim });

    const user = await User.findOne({ did: sessionDid });
    if (!user) {
      throw new Error('You are not a valid user, please login and retry');
    }
    if (user.extraDid.includes(userDid) === false) {
      throw new Error('You are providing an invalid DID');
    }

    const type = toTypeInfo(userDid);
    const w = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    if (w.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }
  },
};
