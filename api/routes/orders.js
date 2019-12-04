/* eslint-disable no-console */
const { swapStorage } = require('../libs/auth');
const { getTokenInfo } = require('../libs/util');

module.exports = {
  init(app) {
    app.get('/api/orders', async (req, res) => {
      if (req.user) {
        const { appToken, assetToken } = await getTokenInfo();
        const orders = await swapStorage.listByDemandAddress(req.user.did);
        res.json({ user: req.user, orders, appToken, assetToken });
      } else {
        res.json([]);
      }
    });
  },
};
