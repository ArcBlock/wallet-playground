const ForgeSDK = require('@arcblock/forge-sdk');
const sortBy = require('lodash/sortBy');
const { swapStorage } = require('../libs/auth');
const { getTokenInfo } = require('../libs/util');
const env = require('../libs/env');

module.exports = {
  init(app) {
    app.get('/api/orders', async (req, res) => {
      if (req.user) {
        const [{ info: appChainInfo }, { info: assetChainInfo }] = await Promise.all([
          ForgeSDK.getChainInfo({ conn: env.chainId }),
          ForgeSDK.getChainInfo({ conn: env.assetChainId }),
        ]);
        const { appToken, assetToken } = await getTokenInfo();
        let orders = await swapStorage.listByDemandAddress(req.user.did);

        // Mark orders as expired
        orders = orders.map(x => {
          if (
            x.demandLocktime <= assetChainInfo.blockHeight ||
            x.offerLocktime <= appChainInfo.blockHeight
          ) {
            x.status = 'expired';
          }

          return x;
        });

        res.json({
          user: req.user,
          orders: sortBy(orders, x => x.updatedAt).reverse(),
          appToken,
          assetToken,
        });
      } else {
        res.json([]);
      }
    });
  },
};
