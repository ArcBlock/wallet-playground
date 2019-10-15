/* eslint-disable no-console */
const Mcrypto = require('@arcblock/mcrypto');
const ForgeSDK = require('@arcblock/forge-sdk');
const TokenMongoStorage = require('@arcblock/did-auth-storage-mongo');
const SwapMongoStorage = require('@arcblock/swap-storage-mongo');
const { fromSecretKey, WalletType } = require('@arcblock/forge-wallet');
const {
  WalletAuthenticator,
  AppAuthenticator,
  AppHandlers,
  WalletHandlers,
  SwapHandlers,
} = require('@arcblock/did-auth');
const env = require('./env');

const type = WalletType({
  role: Mcrypto.types.RoleType.ROLE_APPLICATION,
  pk: Mcrypto.types.KeyType.ED25519,
  hash: Mcrypto.types.HashType.SHA3,
});

if (env.chainHost) {
  ForgeSDK.connect(env.chainHost, { chainId: env.chainId, name: env.chainId, default: true });
  console.log('Connected to chainHost', env.chainHost);
  if (env.assetChainHost) {
    ForgeSDK.connect(env.assetChainHost, { chainId: env.assetChainId, name: env.assetChainId });
    console.log('Connected to assetChainHost', env.assetChainHost);
  }
}

const wallet = fromSecretKey(process.env.APP_SK, type).toJSON();

const walletAuth = new WalletAuthenticator({
  wallet,
  baseUrl: env.baseUrl,
  appInfo: {
    name: env.appName,
    description: env.appDescription,
    icon: 'https://arcblock.oss-cn-beijing.aliyuncs.com/images/wallet-round.png',
    path: 'https://abtwallet.io/i/',
    publisher: `did:abt:${wallet.address}`,
  },
  chainInfo: {
    chainHost: env.chainHost,
    chainId: env.chainId,
  },
});

const tokenStorage = new TokenMongoStorage({
  url: process.env.MONGO_URI,
});
const swapStorage = new SwapMongoStorage({
  url: process.env.MONGO_URI,
});

const walletHandlers = new WalletHandlers({
  authenticator: walletAuth,
  tokenStorage,
});

const swapHandlers = new SwapHandlers({
  authenticator: walletAuth,
  tokenStorage,
  swapStorage,
  offerChain: env.chainId,
  demandChain: env.assetChainId,
});

const appAuth = new AppAuthenticator(wallet);
const appHandlers = new AppHandlers(appAuth);

module.exports = {
  authenticator: walletAuth,
  handlers: walletHandlers,
  tokenStorage,
  swapStorage,
  swapHandlers,
  appAuth,
  appHandlers,
  wallet,
};
