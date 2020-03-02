const { User, VerificationToken } = require('../../models');
const env = require('../../libs/env');
const mail = require('../../libs/mail');
const logger = require('../../libs/logger')
module.exports = {
  action: 'consume_vc',
  claims: {
    verifiableCredential : async () => ({
      description: 'Please provide your vc',
      fields: ['EmailVerificationCredential'],
    }),
  },

  onAuth: async ({ claims, userDid, token, storage }) => {
    //console.log('auth.onAuth', { userPk, userDid });
    //try{
      const vcStr = claims.find(x => x.type === 'verifiableCredential').EmailVerificationCredential;
      let user = await User.findOne({ did: userDid });
      const verifyToken = await VerificationToken.generate(userDid); 
      const vc =  JSON.parse(vcStr)
      
    //}catch (err) {
//      console.error('vc.err', err);
    //}
  }

};
