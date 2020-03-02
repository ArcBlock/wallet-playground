/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');

const env = require('../../libs/env');
const mail = require('../../libs/mail');
const { User, VerificationToken } = require('../../models');

module.exports = {
  action: 'send_verification_email',
  claims: {
    signature: async ({ userDid }) => {
      const wallet = ForgeSDK.Wallet.fromRandom();
      const user = await User.findOne({ did: userDid });
      if (!user) {
        throw new Error('user not found');
      }
      const challenge = ForgeSDK.Util.toHex(wallet.publicKey)
        .replace(/^0x/, '')
        .toUpperCase();

      return {
        description: 'Sign the challenge to receive verification email',
        data: challenge,
        type: 'mime:text/plain',
      };
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const user = await User.findOne({ did: userDid });

    try {
      const type = toTypeInfo(userDid);
      const wallet = ForgeSDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (wallet.verify(claim.origin, claim.sig) === false) {
        throw new Error('Challenge signature invalid');
      }

      // Send email automatically
      const verifyToken = await VerificationToken.generate(userDid);
      const verifyUrl = `${env.baseUrl}/api/users/verify/${verifyToken}`;
      const result = await mail.send({
        to: user.email,
        subject: 'Activate your token swap console account',
        text: `Please click this ${verifyUrl} to activate your token-swap-console account, this link will expire after 10 minutes.`, // eslint-disable-line
      });

      logger.info('send verify email', result);
    } catch (err) {
      logger.error('send.onAuth.error', err);
      throw new Error(`send failed ${err.message}`);
    }
  },
};
