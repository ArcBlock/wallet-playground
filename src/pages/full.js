/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import WalletDownload from '@arcblock/ux/lib/Wallet/Download';
import Tag from '@arcblock/ux/lib/Tag';
import { SessionContext, PlaygroundAction } from '@arcblock/did-playground';

import Layout from '../components/layout';

import AuthButton from '../components/auth/general';
import SignButton from '../components/auth/auth/sign';
import AgentButton from '../components/auth/auth/agent';
import ConsumeAssetButton from '../components/auth/consume_asset';
import AcquireMovieTicket from '../components/auth/acquire_ticket';
import TransferAssetOut from '../components/auth/transfer_asset_out';
import TransferAssetIn from '../components/auth/transfer_asset_in';
import TransferTokenAssetIn from '../components/auth/transfer_token_asset_in';
import TransferTokenAssetOut from '../components/auth/transfer_token_asset_out';

import { version } from '../../package.json';

export default function IndexPage() {
  const { session } = useContext(SessionContext);
  const { token } = session;

  return (
    <Layout title="Home">
      <Main>
        <Typography component="h2" variant="h5" className="page-header" color="textPrimary">
          ABT Wallet Playground<Tag type="success">V{version}</Tag>
        </Typography>
        <Typography component="h3" variant="subtitle1" color="textSecondary">
          {token.local.symbol} is the token on Local Chain, {token.foreign.symbol} is the token on Foreign Chain.
        </Typography>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Feeling lucky{' '}
            <Typography component="small" color="textSecondary">
              Get your account funded for doing later testing
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="receive_foreign_token"
              className="action"
              buttonVariant="contained"
              amount="random"
              title={`Get Random ${token.foreign.symbol}`}
            />
            <PlaygroundAction
              action="receive_local_token"
              className="action"
              amount="random"
              title={`Get Random ${token.local.symbol}`}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Cross Chain Currency Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Show the full potential of cross-chain transactions.
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="exchange_to_foreign_token"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Buy 1 ${token.foreign.symbol} with 5 ${token.local.symbol}`}
              exchangeRate={5}
              amount={1}
            />
            <PlaygroundAction
              action="exchange_to_local_token"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Sell 1 ${token.foreign.symbol} for 5 ${token.local.symbol}`}
              exchangeRate={5}
              amount={1}
            />
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
            <PlaygroundAction
              action="receive_local_token"
              className="action"
              amount={1}
              title={`Send 1 ${token.local.symbol} to me`}
            />
            <PlaygroundAction
              action="send_local_token"
              className="action"
              amount={1}
              title={`Send 1 ${token.local.symbol} to application`}
            />
            <TransferAssetOut {...session} />
            <TransferAssetIn {...session} />
            <TransferTokenAssetIn {...session} />
            <TransferTokenAssetOut {...session} />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Cross Chain Asset Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Buy/sell assets from another chain
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="buy_local_certificate_with_foreign_token"
              className="action"
              price={0.99}
              title={`Buy Local Certificate with 0.99 ${token.foreign.symbol}`}
              name="Local Certificate"
              description="This is a test certificate that is on local chain"
            />
            <PlaygroundAction
              action="sell_local_certificate_for_foreign_token"
              className="action"
              price={1}
              title={`Sell Local Certificate for 1 ${token.foreign.symbol}`}
              name="Local Certificate"
            />

            <PlaygroundAction
              action="buy_local_badge_with_foreign_token"
              className="action"
              price={0.99}
              title={`Buy Local Badge with 0.99 ${token.foreign.symbol}`}
              name="Local Badge"
              description="This is a test badge that is on local chain"
            />
            <PlaygroundAction
              action="sell_local_badge_for_foreign_token"
              className="action"
              price={1}
              title={`Sell Local Badge for 1 ${token.foreign.symbol}`}
              name="Local Badge"
            />

            <PlaygroundAction
              action="buy_local_ticket_with_foreign_token"
              className="action"
              price={0.99}
              title={`Buy Local Ticket with 0.99 ${token.foreign.symbol}`}
              name="Local Ticket"
              description="This is a test ticket that is on local chain"
            />
            <PlaygroundAction
              action="sell_local_ticket_for_foreign_token"
              className="action"
              price={1}
              title={`Sell Local Ticket for 1 ${token.foreign.symbol}`}
              name="Local Ticket"
            />

            <PlaygroundAction
              action="buy_foreign_certificate_with_local_token"
              className="action"
              price={0.99}
              title={`Buy Foreign Certificate with 0.99 ${token.local.symbol}`}
              name="Foreign Certificate"
              description="This is a test certificate that is on foreign chain"
            />
            <PlaygroundAction
              action="sell_foreign_certificate_for_local_token"
              className="action"
              price={1}
              title={`Sell Foreign Certificate for 1 ${token.local.symbol}`}
              name="Foreign Certificate"
            />
            <PlaygroundAction
              action="buy_foreign_badge_with_local_token"
              className="action"
              price={0.99}
              title={`Buy Foreign Badge with 0.99 ${token.local.symbol}`}
              name="Foreign Badge"
              description="This is a test badge that is on foreign chain"
            />
            <PlaygroundAction
              action="sell_foreign_badge_for_local_token"
              className="action"
              price={1}
              title={`Sell Foreign Badge for 1 ${token.local.symbol}`}
              name="Foreign Badge"
            />
            <PlaygroundAction
              action="buy_foreign_ticket_with_local_token"
              className="action"
              price={0.99}
              title={`Buy Foreign Ticket with 0.99 ${token.local.symbol}`}
              name="Foreign Ticket"
              description="This is a test ticket that is on foreign chain"
            />
            <PlaygroundAction
              action="sell_foreign_ticket_for_local_token"
              className="action"
              price={1}
              title={`Sell Foreign Ticket for 1 ${token.local.symbol}`}
              name="Foreign Ticket"
            />
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
            <PlaygroundAction
              className="action"
              title={`Buy 1 Local Certificate with 1 ${token.local.symbol}`}
              action="buy_local_certificate_with_local_token"
              payAmount={1}
              receiveAmount={1}
              name="Local Certificate"
            />
            <PlaygroundAction
              className="action"
              title="Buy 1 Local Certificate for Free"
              action="buy_local_certificate_with_local_token"
              payAmount={0}
              receiveAmount={1}
              name="Local Certificate"
            />
            <PlaygroundAction
              className="action"
              title={`Sell 1 Local Certificate For 1 ${token.local.symbol}`}
              action="sell_local_certificate_for_local_token"
              payAmount={1}
              receiveAmount={1}
              name="Local Certificate"
            />
            <PlaygroundAction
              className="action"
              title={`Buy 1 Local Badge with 1 ${token.local.symbol}`}
              action="buy_local_badge_with_local_token"
              payAmount={1}
              receiveAmount={1}
              name="Local Badge"
            />
            <PlaygroundAction
              className="action"
              title="Buy 1 Local Badge for Free"
              action="buy_local_badge_with_local_token"
              payAmount={0}
              receiveAmount={1}
              name="Local Badge"
            />
            <PlaygroundAction
              className="action"
              title={`Sell 1 Local Badge For 1 ${token.local.symbol}`}
              action="sell_local_badge_for_local_token"
              payAmount={1}
              receiveAmount={1}
              name="Local Badge"
            />
            <PlaygroundAction
              className="action"
              title={`Buy 1 Local Ticket with 1 ${token.local.symbol}`}
              action="buy_local_ticket_with_local_token"
              payAmount={1}
              receiveAmount={1}
              name="Local Ticket"
            />
            <PlaygroundAction
              className="action"
              title="Buy 1 Local Ticket for Free"
              action="buy_local_ticket_with_local_token"
              payAmount={0}
              receiveAmount={1}
              name="Local Ticket"
            />
            <PlaygroundAction
              className="action"
              title={`Sell 1 Local Ticket For 1 ${token.local.symbol}`}
              action="sell_local_ticket_for_local_token"
              payAmount={1}
              receiveAmount={1}
              name="Local Ticket"
            />
            <PlaygroundAction
              className="action"
              title="Buy 1 Local Ticket with 1 Certificate"
              action="buy_local_ticket_with_local_certificate"
              payAmount={1}
              receiveAmount={1}
              name="Local Ticket"
            />
            <PlaygroundAction
              className="action"
              title="Buy 1 Local Certificate with 1 Ticket"
              action="buy_local_certificate_with_local_ticket"
              payAmount={1}
              receiveAmount={1}
              name="Local Ticket"
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Consume Asset Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Consume an asset
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              className="action"
              title="Consume Local Certificate"
              action="consume_asset"
              pfc="local"
              type="certificate"
            />
            <PlaygroundAction
              className="action"
              title="Consume Local Badge"
              action="consume_asset"
              pfc="local"
              type="badge"
            />
            <PlaygroundAction
              className="action"
              title="Consume Local Ticket"
              action="consume_asset"
              pfc="local"
              type="ticket"
            />
            <PlaygroundAction
              className="action"
              title="Consume Foreign Certificate"
              action="consume_asset"
              pfc="foreign"
              type="certificate"
            />
            <PlaygroundAction
              className="action"
              title="Consume Foreign Badge"
              action="consume_asset"
              pfc="foreign"
              type="badge"
            />
            <PlaygroundAction
              className="action"
              title="Consume Foreign Ticket"
              action="consume_asset"
              pfc="foreign"
              type="ticket"
            />
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
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Asset Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Consume/Acquire an asset
            </Typography>
          </Typography>
          <div className="section__content">
            <AcquireMovieTicket count={1} />
            <AcquireMovieTicket count={2} />
            <PlaygroundAction
              className="action"
              title="Consume Movie Ticket"
              action="consume_asset"
              pfc="local"
              typeUrl="fg:x:movie_ticket"
            />
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
