const sortBy = require('lodash/sortBy');
const { swapStorage } = require('../libs/auth');
const { getTokenInfo } = require('../libs/util');

module.exports = {
  init(app) {
    app.get('/api/orders', async (req, res) => {
      if (req.user) {
        const tokenInfo = await getTokenInfo();
        const orders = await swapStorage.listByDemandAddress(req.user.did);

        res.json({
          user: req.user,
          orders: sortBy(orders, x => x.createdAt).reverse(),
          tokenInfo,
        });
      } else {
        res.json([]);
      }
    });
  },
};
