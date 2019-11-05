/* eslint-disable no-console */
module.exports = {
  action: 'auth',
  claims: {
    authPrincipal: async () => ({
      description: 'Please select an DID to use this application',
      target: '',
    }),
  },

  onAuth: async ({ userDid, userPk }) => {
    console.log('auth.onAuth', { userPk, userDid });
  },
};
