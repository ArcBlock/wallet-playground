/* eslint-disable no-console */
module.exports = {
  action: 'profile',
  claims: {
    profile: async () => ({
      description: 'Please provide your full profile',
      fields: ['fullName', 'email', 'phone', 'signature', 'avatar', 'birthday'],
    }),
  },

  onAuth: async ({ userDid, userPk }) => {
    console.log('auth.onAuth', { userPk, userDid });
  },
};
