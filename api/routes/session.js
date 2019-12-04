const { getTokenInfo } = require('../libs/util');

module.exports = {
  init(app) {
    app.get('/api/session', async (req, res) => {
      const { appToken, assetToken } = await getTokenInfo();
      res.json({ user: req.user, token: appToken, assetToken });
    });

    app.post('/api/logout', (req, res) => {
      req.user = null;
      res.json({ user: null });
    });
  },
};
