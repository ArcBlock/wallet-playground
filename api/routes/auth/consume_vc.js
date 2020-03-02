const { User, VerificationToken } = require('../../models');
const ForgeSDK = require('@arcblock/forge-sdk');
const { types, getSigner, getHasher } = require('@arcblock/mcrypto');
const stringify = require('json-stable-stringify');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'consume_vc',
  claims: {
    profile: async () => ({
      description: 'Please provide your email',
      fields: ['email'],
    }),
    verifiableCredential: async () => ({
      description: 'Please provide your vc which proves your information',
      items: 'EmailVerificationCredential',
    }),
  },

  onAuth: async ({ claims, userDid, token, storage }) => {
    //console.log('auth.onAuth', { userPk, userDid });
    const userEmail = claims.find(x => x.type === 'profile').email
    const vcStr = claims.find(x => x.type === 'verifiableCredential').EmailVerificationCredential;
    let user = await User.findOne({ did: userDid });
    const hasher = getHasher(types.HashType.SHA3);
    const verifyToken = await VerificationToken.generate(userDid);
    const vc = JSON.parse(vcStr);
    //verify vc signature
    const proof = vc['proof'];
    delete vc.proof;
    const strVC = stringify(vc);
    
    const w = ForgeSDK.Wallet.fromJSON(wallet);
    
    if (w.verify(strVC, ForgeSDK.Util.fromBase64(proof['jws'])) !== true) {
      throw Error('VC 签名错误');
    }
    if (vc['expirationDate'] !== undefined && Date(vc['expirationDate']).getTime() < Date.now) {
      throw Error('VC 已过期');
    }
    if (vc['issuanceDate'] !== undefined && Date(vc['issuanceDate']).getTime() > Date.now) {
      throw Error('VC 未生效');
    }
    if (vc['type'] === 'EmailVerificationCredential') {
      if (vc['credentialSubject']['id'] !== user.did) {
        throw Error('VC 不属于你');
      }
      const digest = ForgeSDK.Util.toBase64(hasher(userEmail, 1));
      if (vc['credentialSubject']['emailDigest'] !== digest) {
        throw Error('VC 与您的邮箱不匹配');
      }
    } else {
      throw Error('不是要求的VC类型');
    }
  },
};
