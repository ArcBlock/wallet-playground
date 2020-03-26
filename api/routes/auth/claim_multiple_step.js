const { getRandomMessage } = require('../../libs/util');

module.exports = {
  action: 'claim_multiple_step',
  claims: [
    {
      signature: async ({ userDid, userPk }) => ({
        type: 'DeclareTx',
        data: {
          itx: { moniker: 'wangshijun' },
          data: {
            type: 'json',
            value: { userDid, userPk },
          },
        },
        description: 'Please sign the transaction',
      }),
    },
    {
      signature: () => ({
        type: 'mime:text/plain',
        data: getRandomMessage(),
        description: 'Please sign the text',
      }),
    },
    {
      signature: async ({ userDid, userPk }) => ({
        type: 'mime:text/html',
        data: `<div>
  <h2 style="color:red;font-weight:bold;border-bottom:1px solid blue;">This is title</h2>
  <ul>
    <li>userDid: ${userDid}</li>
    <li>userPk: ${userPk}</li>
  </ul>
</div>`,
        description: 'Please sign the html',
      }),
    },
  ],

  onAuth: async ({ userDid, userPk, claims, step }) => {
    logger.info('claim.multiStep.onAuth', { step, userPk, userDid, claims });
    // const type = toTypeInfo(userDid);
    // const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    // const claim = claims.find(x => x.type === 'signature');
  },
};
