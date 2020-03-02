const { User, VerificationToken } = require('../../models');
const env = require('../../libs/env');
const mail = require('../../libs/mail');
const logger = require('../../libs/logger')
module.exports = {
  action: 'verify_email',
  claims: {
    profile: async () => ({
      description: 'Please provide your email',
      fields: ['fullName', 'email'],
    }),
  },

  onAuth: async ({ claims, userDid, token, storage }) => {
    //console.log('auth.onAuth', { userPk, userDid });
    try{
      const profile = claims.find(x => x.type === 'profile');
      let user = await User.findOne({ did: userDid });
      const verifyToken = await VerificationToken.generate(userDid);
      const verifyUrl = `${env.baseUrl}/api/users/verify/${verifyToken}`;
      const result = await mail.send({
        to: profile.email,
        subject: 'Activate your token swap console account',
        text: `Please click this ${verifyUrl} to activate your token-swap-console account, this link will expire after 10 minutes.`, // eslint-disable-line
      });

      logger.info('verify user', result);
      
    }catch (err) {
      console.error('verify.email.err', err);
    }
      // Send email automatically

/*       await storage.update(token, {
        did: userDid,
        authCode: 'not_verified',
        authMessage: `Please check your email ${user.email} to activate your account`,
      });
 */
    }

};
