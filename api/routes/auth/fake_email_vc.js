/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const ForgeWallet = require('@arcblock/forge-wallet');
const Mcrypto = require('@arcblock/mcrypto');
const { toTypeInfo } = require('@arcblock/did');
const { create } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');

const data = 'abcdefghijklmnopqrstuvwxyz'.repeat(32);
const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

module.exports = {
  action: 'fake_email_vc',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { type } }) => {
      const params = {
        transaction: {
          type: 'DeclareTx',
          data: {
            itx: { moniker: 'wangshijun' },
          },
        },

        text: {
          type: 'mime:text/plain',
          data: JSON.stringify({ userDid, userPk, random: Math.random() }, null, 2),
        },

        html: {
          type: 'mime:text/html',
          data: `<div>
  <h2>This is title</h2>
  <ul>
    <li>User DID: ${userDid}</li>
    <li>User PK: ${userPk}</li>
    <li>Random: ${Math.random()}</li>
  </ul>
</div>`,
        },

        // If we request user to sign some sensitive data or large piece of data
        // Just ask him/her to sign the digest
        digest: {
          // A developer should convert the hash of his data to base58 format => digest
          digest: ForgeSDK.Util.toBase58(hasher(data, 1)),
        },
      };

      if (!params[type]) {
        throw new Error(`Unsupported signature type ${type}`);
      }

      return Object.assign({ description: `Please sign the ${type} to prove yourself` }, params[type]);
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    console.log('claim.signature.onAuth', { userPk, userDid, claim });

    if (claim.origin) {
      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('Origin 签名错误');
      }
    }

    // We do not need to hash the data when verifying
    if (claim.digest) {
      if (user.verify(claim.digest, claim.sig, false) === false) {
        throw new Error('Digest 签名错误');
      }
    }

    const w = ForgeWallet.fromJSON(wallet);
    const randomEmail = `${ForgeWallet.fromRandom()
      .toAddress()
      .substring(0, 10)}@arcblock.io`;
    const emailDigest = hasher(randomEmail, 1);
    const vc = create({
      type: 'EmailVerificationCredential',
      issuer: {
        wallet: w,
        name: 'ArcBlock.KYC.Email',
      },
      subject: {
        id: userDid,
        emailDigest: ForgeSDK.Util.toBase64(emailDigest),
        method: 'SHA3',
      },
    });
    return {
      disposition: 'attachment',
      type: 'VerifiableCredential',
      data: vc,
      tag: randomEmail,
    };
  },
};
