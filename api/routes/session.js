const ForgeSDK = require('@arcblock/forge-sdk');
const env = require('../libs/env');

module.exports = {
  init(app) {
    app.get('/api/session', async (req, res) => {
      const { getForgeState: data } = await ForgeSDK.doRawQuery(
        `{
          getForgeState {
            code
            state {
              token {
                decimal
                description
                icon
                inflationRate
                initialSupply
                name
                symbol
                totalSupply
                unit
              }
            }
          }
        }`,
        { conn: env.chainId }
      );

      const { getForgeState: data2 } = await ForgeSDK.doRawQuery(
        `{
          getForgeState {
            code
            state {
              token {
                decimal
                description
                icon
                inflationRate
                initialSupply
                name
                symbol
                totalSupply
                unit
              }
            }
          }
        }`,
        { conn: env.assetChainId }
      );
      res.json({ user: req.user, token: data.state.token, assetToken: data2.state.token });
    });

    app.post('/api/logout', (req, res) => {
      req.user = null;
      res.json({ user: null });
    });
  },
};
