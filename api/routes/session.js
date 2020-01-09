const env = require('../libs/env');
const { getTokenInfo } = require('../libs/util');

module.exports = {
  init(app) {
    app.get('/api/session', async (req, res) => {
      const data = await getTokenInfo();
      res.json({ user: req.user, token: data[env.chainId], assetToken: data[env.assetChainId] });
    });

    app.post('/api/logout', (req, res) => {
      req.user = null;
      res.json({ user: null });
    });
  },
};
