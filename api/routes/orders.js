const sortBy = require('lodash/sortBy');
const { swapStorage } = require('../libs/auth');
const { getTokenInfo } = require('../libs/util');
const env = require('../libs/env');

module.exports = {
  init(app) {
    app.get('/api/orders', async (req, res) => {
      if (req.user) {
        const { appToken, assetToken } = await getTokenInfo();
        const orders = await swapStorage.listByDemandAddress(req.user.did);

        res.json({
          user: req.user,
          orders: sortBy(orders, x => x.createdAt).reverse(),
          tokenInfo: {
            [env.chainId]: appToken,
            [env.assetChainId]: assetToken,
          },
        });
      } else {
        res.json([]);
      }
    });
  },
};
