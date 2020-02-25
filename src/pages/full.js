/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import WalletDownload from '@arcblock/ux/lib/Wallet/Download';
import Tag from '@arcblock/ux/lib/Tag';

import Layout from '../components/layout';
import { SessionContext } from '../components/PlaygroundAction/session';

import AuthButton from '../components/auth/general';
import SignButton from '../components/auth/auth/sign';
import AgentButton from '../components/auth/auth/agent';
import ConsumeAssetButton from '../components/auth/consume_asset';
import AcquireMovieTicket from '../components/auth/acquire_ticket';
import Exchange from '../components/auth/exchange';
import FundTbaButton from '../components/auth/fund_tba';
import FundPlayButton from '../components/auth/fund_play';
import SwapTokenButton from '../components/auth/swap_token';
import BuyBadgeButton from '../components/auth/swap_badge';
import SwapBadgesButton from '../components/auth/swap_badges';
// import SwapAssetsButton from '../components/auth/swap_assets';
import BuyTicketButton from '../components/auth/swap_ticket';
import CertificateButton from '../components/auth/swap_certificate';
import TransferTokenOut from '../components/auth/transfer_token_out';
import TransferTokenIn from '../components/auth/transfer_token_in';
import TransferAssetOut from '../components/auth/transfer_asset_out';
import TransferAssetIn from '../components/auth/transfer_asset_in';
import TransferTokenAssetIn from '../components/auth/transfer_token_asset_in';
import TransferTokenAssetOut from '../components/auth/transfer_token_asset_out';

import { version } from '../../package.json';

export default function IndexPage() {
  const { session } = useContext(SessionContext);
  const { token, assetToken } = session;

  return (
    <Layout title="Home">
      <Main>
        <Typography component="h2" variant="h5" className="page-header" color="textPrimary">
          ABT Wallet Playground<Tag type="success">V{version}</Tag>
        </Typography>
        <Typography component="h3" variant="subtitle1" color="textSecondary">
          {token.symbol} is the token on Local Chain, {assetToken.symbol} is the token on Foreign Chain.
        </Typography>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Feeling lucky{' '}
            <Typography component="small" color="textSecondary">
              Get your account funded for doing later testing
            </Typography>
          </Typography>
          <div className="section__content">
            <FundTbaButton {...session} />
            <FundPlayButton {...session} />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Atomic Swap Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Show the full potential of cross-chain transactions.
            </Typography>
          </Typography>
          <div className="section__content">
            <BuyBadgeButton {...session} />
            <BuyTicketButton {...session} />
            <CertificateButton {...session} action="buy" />
            <CertificateButton {...session} action="sell" />
            <SwapTokenButton {...session} action="buy" />
            <SwapTokenButton {...session} action="sell" />
            <SwapBadgesButton {...session} action="buy" />
            <SwapBadgesButton {...session} action="sell" />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Transfer Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Help to generate different transfer transactions in ABT Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <TransferTokenOut {...session} />
            <TransferTokenIn {...session} />
            <TransferAssetOut {...session} />
            <TransferAssetIn {...session} />
            <TransferTokenAssetIn {...session} />
            <TransferTokenAssetOut {...session} />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Exchange Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Help to generate different exchange transactions in ABT Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <Exchange {...session} receiveType="asset" payType="token" />
            <Exchange {...session} receiveType="token" payType="asset" />
            <Exchange {...session} receiveType="asset" payType="asset" />
            <Exchange {...session} receiveType="asset" receiveCount={2} payType="asset" />
            <Exchange {...session} receiveType="asset" payCount={2} payType="asset" />
            <Exchange {...session} receiveType="asset" receiveCount={2} payType="asset" payCount={2} />
            <Exchange {...session} receiveType="token" receiveCount={2} payType="asset" payCount={2} />
            <Exchange {...session} receiveType="asset" receiveCount={5} payType="token" payCount={1} />
            <Exchange {...session} receiveCount={5} receiveType="asset" payCount={5} payType="asset" />
            <Exchange {...session} receiveType="token" receiveCount={100000} payType="asset" payCount={1} />
            <Exchange {...session} receiveType="token" receiveCount={0.001} payType="asset" payCount={1} />
            <Exchange {...session} receiveType="token" receiveCount={100000.0001} payType="asset" payCount={1} />
            <Exchange {...session} receiveType="token" receiveCount={0.000001} payType="asset" payCount={1} />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            DID Auth Claims{' '}
            <Typography component="small" color="textSecondary">
              Help to test different DID Auth Claims in ABT Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button="Request Full Profile"
              action="profile"
              messages={{
                title: 'Profile Required',
                scan: 'Scan QR code to provide profile',
                confirm: 'Confirm on your ABT Wallet',
                success: 'Profile provided',
              }}
            />
            <AuthButton
              button="Show DApp Error"
              action="error"
              messages={{
                title: 'dApp will throw an error',
                scan: 'Scan QR code to get the error',
                confirm: 'Confirm on your ABT Wallet',
                success: 'You will not see this',
              }}
            />
            <AuthButton
              button="Auth Request Timeout"
              action="timeout"
              extraParams={{ stage: 'request' }}
              messages={{
                title: 'Request Timeout',
                scan: 'Scan QR code to test the timeout',
                confirm: 'Confirm on your ABT Wallet',
                success: 'You will not see this',
              }}
            />
            <AuthButton
              button="Auth Response Timeout"
              action="timeout"
              extraParams={{ stage: 'response' }}
              messages={{
                title: 'Response Timeout',
                scan: 'Scan QR code to test the timeout',
                confirm: 'Confirm on your ABT Wallet',
                success: 'You will not see this',
              }}
            />
            <AuthButton
              button="Create New DID"
              action="claim_create_did"
              messages={{
                title: 'Create DID',
                scan: 'Scan QR code to get the did spec',
                confirm: 'Confirm on your ABT Wallet',
                success: 'Application Created',
              }}
            />
            <AuthButton
              button="Proof of DID Holding"
              action="claim_target"
              messages={{
                title: 'Provide DID',
                scan: 'Scan QR code to prove you own the DID',
                confirm: 'Confirm on your ABT Wallet',
                success: 'DID holding confirmed',
              }}
            />
            <SignButton {...session} type="transaction" />
            <SignButton {...session} type="text" />
            <SignButton {...session} type="html" />
            <SignButton {...session} type="digest" />
            <AgentButton {...session} />
            <AuthButton
              button="Multiple Claims"
              action="claim_multiple"
              messages={{
                title: 'Multiple Claims',
                scan: 'Scan QR code to get multiple claims at once',
                confirm: 'Confirm on your ABT Wallet',
                success: 'Claims processed successfully',
              }}
            />
            <AuthButton
              button="Multiple Steps"
              action="claim_multiple_step"
              messages={{
                title: 'Multiple Steps',
                scan: 'Scan QR code to get multiple claims in sequential',
                confirm: 'Confirm on your ABT Wallet',
                success: 'Claims processed successfully',
              }}
            />
          </div>
        </section>
        <section className="section" style={{ display: 'none' }}>
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Security{' '}
            <Typography component="small" color="textSecondary">
              Try Overwrite Asset Chain
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button="Try Overwrite Asset Chain"
              action="claim_overwrite"
              messages={{
                title: 'Try Overwrite',
                scan: 'Scan QR code to get fake asset chain info',
                confirm: 'Confirm on your ABT Wallet',
                success: 'You will never see this, if so, wallet has bug',
              }}
            />
          </div>
        </section>
        <section className="section" style={{ display: 'none' }}>
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Asset Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Consume/Acquire an asset
            </Typography>
          </Typography>
          <div className="section__content">
            <AcquireMovieTicket count={1} />
            <AcquireMovieTicket count={2} />
            <ConsumeAssetButton {...session} />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Do not have ABT Wallet?
          </Typography>
          <div className="section__content">
            <div style={{ padding: 24, background: '#44cdc6', color: 'rgb(255, 255, 255)' }}>
              <WalletDownload
                layout="horizontal"
                title="Make sure you have your phone handy with the ABT Wallet downloaded."
              />
            </div>
          </div>
        </section>
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  margin: 40px 0 0;

  a {
    color: ${props => props.theme.colors.green};
    text-decoration: none;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-description {
    margin-bottom: 30px;
  }

  .section {
    margin-top: 48px;
    .section__header {
      margin-bottom: 24px;
    }

    .section__content {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: flex-start;

      .action {
        margin-bottom: 16px;
        margin-right: 32px;
        width: 360px;
        display: block;
      }
    }
  }
`;
