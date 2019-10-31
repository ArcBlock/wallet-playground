/* eslint-disable no-console */
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const ForgeSDK = require('@arcblock/forge-sdk');
const { fromJSON } = require('@arcblock/forge-wallet');
const { wallet } = require('../api/libs/auth');
const env = require('../api/libs/env');

const appWallet = fromJSON(wallet);

(async () => {
  try {
    let hash = await ForgeSDK.declare(
      {
        moniker: 'abt_wallet_playground',
        wallet: appWallet,
      },
      { conn: env.chainId }
    );

    console.log(`Application declared on chain ${env.chainId}`, hash);

    if (env.assetChainId) {
      hash = await ForgeSDK.declare(
        {
          moniker: 'abt_wallet_playground',
          wallet: appWallet,
        },
        { conn: env.assetChainId }
      );
      console.log(`Application declared on chain ${env.assetChainId}`, hash);
    }

    process.exit(0);
  } catch (err) {
    console.error(err.errors);
    process.exit(1);
  }
})();
