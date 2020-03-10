const ForgeSDK = require('@arcblock/forge-sdk');
const { verify } = require('@arcblock/vc');
const { types, getHasher } = require('@arcblock/mcrypto');
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
      return {
        description: 'Please provide your vc which proves your information',
        item: 'EmailVerificationCredential',
        trustedIssuers: [w.toAddress(), 'zNKmAZ88dywkBw3mtCf2UCFpfreaZSMMWkyi'],
      };
    },
  },

  onAuth: async ({ claims, userDid }) => {
    const userEmail = claims.find(x => x.type === 'profile').email;
    const vcStr = claims.find(x => x.type === 'verifiableCredential').EmailVerificationCredential;
    const hasher = getHasher(types.HashType.SHA3);
    const vc = JSON.parse(vcStr);
    if (vc.type === 'EmailVerificationCredential') {
      if (vc.credentialSubject.id !== userDid) {
        throw Error('VC 不属于你');
      }
      const digest = ForgeSDK.Util.toBase64(hasher(userEmail, 1));
      if (vc.credentialSubject.emailDigest !== digest) {
        throw Error('VC 与您的邮箱不匹配');
      }
    } else {
      throw Error('不是要求的VC类型');
    }
    const w = ForgeSDK.Wallet.fromJSON(wallet);

    verify({ vc, ownerDid: userDid, trustedIssuers: [w.toAddress()] });
  },
};
