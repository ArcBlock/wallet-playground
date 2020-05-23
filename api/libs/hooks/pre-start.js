/* eslint-disable no-console */
require('dotenv').config();

const ForgeSDK = require('@arcblock/forge-sdk');

const { wallet } = require('../auth');
const { getAccountStateOptions } = require('../util');
const env = require('../env');

(async () => {
  try {
    // Check for application account
    const { state } = await ForgeSDK.getAccountState({ address: wallet.address }, getAccountStateOptions);
    if (!state) {
      console.error('Application account not declared on chain, abort!');

      const app = ForgeSDK.Wallet.fromJSON(wallet);
      let hash = await ForgeSDK.declare(
        {
          moniker: 'abt_wallet_playground',
          wallet: app,
        },
        { conn: env.chainId }
      );

      console.log(`Application declared on chain ${env.chainId}`, hash);

      if (env.assetChainId) {
        hash = await ForgeSDK.declare(
          {
            moniker: 'abt_wallet_playground',
            wallet: app,
          },
          { conn: env.assetChainId }
        );
        console.log(`Application declared on chain ${env.assetChainId}`, hash);
      }

      process.exit(0);
    } else {
      console.error('Application account declared on chain');
    }
  } catch (err) {
    console.error(err);
    console.error('Application account check failed, abort!');
    process.exit(1);
  }
})();
