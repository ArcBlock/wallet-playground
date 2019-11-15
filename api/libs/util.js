const ForgeSDK = require('@arcblock/forge-sdk');

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

module.exports = {
  getTransferrableAssets,
};
