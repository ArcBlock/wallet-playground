const ForgeSDK = require('@arcblock/forge-sdk');
const { verifyPresentation } = require('@arcblock/vc');
const { User } = require('../../models');
const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'consume_vc',
  claims: {
    verifiableCredential: async ({ userDid, extraParams: { type } }) => {
      const w = ForgeSDK.Wallet.fromJSON(wallet);
      const trustedIssuers = (env.trustedIssuers || 'zNKrLtPXN5ur9qMkwKWMYNzGi4D6XjWqTEjQ')
        .split(',')
        .concat(w.toAddress());
      let tag = '';
      if (type === 'EmailVerificationCredential') {
        const exist = await User.findOne({ did: userDid });
        tag = exist.email;
      }
      return {
        description: 'Please provide your vc which proves your information',
        item: type,
        trustedIssuers,
        tag,
      };
    },
  },

  onAuth: async ({ claims, challenge, extraParams: { type } }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('unsafe response');
    }

    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];

    const vc = JSON.parse(vcArray[0]);

    if (vc.type !== type && vc.type.indexOf(type) === -1) {
      throw Error('不是要求的VC类型');
    }

    const w = ForgeSDK.Wallet.fromJSON(wallet);
    const trustedIssuers = (env.trustedIssuers || 'zNKrLtPXN5ur9qMkwKWMYNzGi4D6XjWqTEjQ')
      .split(',')
      .concat(w.toAddress());

    verifyPresentation({ presentation, trustedIssuers, challenge });
  },
};
