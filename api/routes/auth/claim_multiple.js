const { getRandomMessage } = require('../../libs/util');
module.exports = {
  action: 'claim_multiple',
  claims: {
    signTx: [
      'signature',
      ({ userDid, userPk }) => ({
        type: 'DeclareTx',
        data: {
          itx: { moniker: 'wangshijun' },
          data: {
            type: 'json',
            value: { userDid, userPk, random: Math.random() },
          },
        },
        description: 'Please sign the transaction',
      }),
    ],
    signText: [
      'signature',
      () => ({
        type: 'mime:text/plain',
        data: getRandomMessage(),
        description: 'Please sign the text',
      }),
    ],
    signHtml: [
      'signature',
      ({ userDid, userPk }) => ({
        type: 'mime:text/html',
        data: `<div>
  <h2>This is title</h2>
  <ul>
    <li>UserDid: ${userDid}</li>
    <li>UserPk: ${userPk}</li>
    <li>Random: ${Math.random()}</li>
  </ul>
</div>`,
        description: 'Please sign the html',
      }),
    ],
  },

  onAuth: async ({ userDid, userPk, claims, step }) => {
    logger.info('claim.multiStep.onAuth', { step, userPk, userDid, claims });
    // const type = toTypeInfo(userDid);
    // const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    // const claim = claims.find(x => x.type === 'signature');
  },
};
