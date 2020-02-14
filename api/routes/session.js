const env = require('../libs/env');
const { getTokenInfo } = require('../libs/util');
const { getExchangeRate } = require('../libs/currency');
const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);

module.exports = {
  init(app) {
    app.get('/api/session', async (req, res) => {
      const data = await getTokenInfo();
      res.json({
        user: req.user,
        token: data[env.chainId],
        assetToken: data[env.assetChainId],
        exchangeRate: isNetlify ? getExchangeRate() : 5,
      });
    });

    app.post('/api/logout', (req, res) => {
      req.user = null;
      res.json({ user: null });
    });

    app.get('/api/env', (req, res) => {
      const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);
      res.type('.js');
      res.send(`window.env = {
  localChainExplorer: "${isNetlify ? 'http://54.84.194.134:8210/node/explorer/txs' : ''}",
  foreignChainExplorer: "${isNetlify ? 'http://54.90.197.111:8210/node/explorer/txs' : ''}",
}`);
    });
  },
};
