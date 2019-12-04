const ForgeSDK = require('@arcblock/forge-sdk');

const env = require('./env');

const getTransferrableAssets = async (userDid, assetCount) => {
  const { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid });
  if (!assets || assets.length === 0) {
    throw new Error('You do not have any asset, use other test to earn one');
  }

  const goodAssets = assets.filter(x => x.transferrable);
  if (!goodAssets.length) {
    throw new Error('You do not have any asset that can be transferred to me');
  }

  if (goodAssets.length < assetCount) {
    throw new Error('You do not have enough assets that can be transferred to me');
  }

  return goodAssets.slice(0, assetCount);
};

const getTokenInfo = async () => {
  const { getForgeState: data } = await ForgeSDK.doRawQuery(
    `{
      getForgeState {
        code
        state {
          token {
            decimal
            description
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

  return { appToken: data.state.token, assetToken: data2.state.token };
};

module.exports = {
  getTransferrableAssets,
  getTokenInfo,
};
