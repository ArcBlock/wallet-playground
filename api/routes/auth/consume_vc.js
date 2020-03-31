const ForgeSDK = require('@arcblock/forge-sdk');
const { fromPublicKey } = require('@arcblock/forge-wallet');
const { toTypeInfo } = require('@arcblock/did');
const stringify = require('json-stable-stringify');
const { fromBase64, fromBase58 } = require('@arcblock/forge-util');

const cloneDeep = require('lodash/cloneDeep');
const { verify, verifyPresentation } = require('@arcblock/vc');
const { types, getHasher } = require('@arcblock/mcrypto');
const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'consume_vc',
  claims: {
    profile: async () => ({
      description: 'Please provide your email',
      fields: ['email'],
    }),
    verifiableCredential: async () => {
      const w = ForgeSDK.Wallet.fromJSON(wallet);
      const trustedIssuers = (env.trustedIssuers || 'zNKrLtPXN5ur9qMkwKWMYNzGi4D6XjWqTEjQ')
        .split(',')
        .concat(w.toAddress());
      return {
        description: 'Please provide your vc which proves your information',
        item: 'EmailVerificationCredential',
        trustedIssuers,
      };
    },
  },

  onAuth: async ({ claims, challenge }) => {
    const userEmail = claims.find(x => x.type === 'profile').email;
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('unsafe response');
    }
    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];
    const hasher = getHasher(types.HashType.SHA3);
    const vc = JSON.parse(vcArray[0]);
    if (vc.type === 'EmailVerificationCredential') {
      const digest = ForgeSDK.Util.toBase64(hasher(userEmail, 1));
      if (vc.credentialSubject.emailDigest !== digest) {
        throw Error('VC 与您的邮箱不匹配');
      }
    } else {
      throw Error('不是要求的VC类型');
    }
    const w = ForgeSDK.Wallet.fromJSON(wallet);
    const trustedIssuers = (env.trustedIssuers || 'zNKrLtPXN5ur9qMkwKWMYNzGi4D6XjWqTEjQ')
      .split(',')
      .concat(w.toAddress());
    verifyPresentation({ presentation, trustedIssuers, challenge });
  },
};
