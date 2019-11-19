/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import qs from 'querystring';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@arcblock/ux/lib/Button';
import WalletDownload from '@arcblock/ux/lib/Wallet/Download';
import Tag from '@arcblock/ux/lib/Tag';
import Auth from '@arcblock/did-react/lib/Auth';

import Layout from '../components/layout';
import useSession from '../hooks/session';
import api from '../libs/api';
import { setToken } from '../libs/auth';

import ProfileButton from '../components/auth/auth/profile';
import AgentButton from '../components/auth/auth/agent';
import ErrorButton from '../components/auth/auth/error';
import Exchange from '../components/auth/exchange';
import FundTbaButton from '../components/auth/fund_tba';
import FundPlayButton from '../components/auth/fund_play';
import SwapTokenButton from '../components/auth/swap_token';
import SwapBadgeButton from '../components/auth/swap_badge';
import SwapBadgesButton from '../components/auth/swap_badges';
import SwapTicketButton from '../components/auth/swap_ticket';
import SwapCertificateButton from '../components/auth/swap_certificate';
import TransferTokenOut from '../components/auth/transfer_token_out';
import TransferTokenIn from '../components/auth/transfer_token_in';
import TransferAssetOut from '../components/auth/transfer_asset_out';
import TransferAssetIn from '../components/auth/transfer_asset_in';
import TransferTokenAssetIn from '../components/auth/transfer_token_asset_in';
import TransferTokenAssetOut from '../components/auth/transfer_token_asset_out';

export default function IndexPage() {
  const session = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session.value && !session.value.user && window.location.search) {
      const params = qs.parse(window.location.search.slice(1));
      try {
        if (params.openLogin && JSON.parse(params.openLogin)) {
          setOpen(true);
        }
      } catch (err) {
        // Do nothing
      }
    }
    // eslint-disable-next-line
  }, [session]);

  const onLogin = async result => {
    if (result.sessionToken) {
      setToken(result.sessionToken);
    }
    window.location.reload();
  };

  if (session.value && !session.value.user) {
    setTimeout(() => setOpen(true), 0);
  }

  return (
    <Layout title="Home">
      <Main>
        <Typography component="h2" variant="h4" className="page-header" color="textPrimary">
          ABT Wallet Playground <Tag type="success">V2.0</Tag>
        </Typography>
        <Typography component="h3" variant="h6" color="textSecondary">
          TBA is the token on Zinc chain, PLAY is the token on App chain.
        </Typography>
        {(session.loading || (session.value && !session.value.user)) && (
          <CircularProgress size={64} color="secondary" />
        )}
        {session.value && session.value.user && (
          <React.Fragment>
            <section className="section">
              <Typography
                component="h3"
                variant="h5"
                className="section__header"
                color="textPrimary"
                gutterBottom>
                Feeling lucky{' '}
                <Typography component="small" color="textSecondary">
                  Get your account funded for doing later testing
                </Typography>
              </Typography>
              <div className="section__content">
                <FundTbaButton {...session.value} />
                <FundPlayButton {...session.value} />
              </div>
            </section>
            <section className="section">
              <Typography
                component="h3"
                variant="h5"
                className="section__header"
                color="textPrimary"
                gutterBottom>
                Atomic Swap Scenarios{' '}
                <Typography component="small" color="textSecondary">
                  Show the full potential of cross-chain transactions.
                </Typography>
              </Typography>
              <div className="section__content">
                <SwapBadgeButton {...session.value} />
                <SwapBadgesButton {...session.value} />
                <SwapTokenButton {...session.value} />
                <SwapTicketButton {...session.value} />
                <SwapCertificateButton {...session.value} />
              </div>
            </section>
            <section className="section">
              <Typography
                component="h3"
                variant="h5"
                className="section__header"
                color="textPrimary"
                gutterBottom>
                Transfer Scenarios{' '}
                <Typography component="small" color="textSecondary">
                  Help to generate different transfer transactions in ABT Wallet
                </Typography>
              </Typography>
              <div className="section__content">
                <TransferTokenOut {...session.value} />
                <TransferTokenIn {...session.value} />
                <TransferAssetOut {...session.value} />
                <TransferAssetIn {...session.value} />
                <TransferTokenAssetIn {...session.value} />
                <TransferTokenAssetOut {...session.value} />
              </div>
            </section>
            <section className="section">
              <Typography
                component="h3"
                variant="h5"
                className="section__header"
                color="textPrimary"
                gutterBottom>
                Exchange Scenarios{' '}
                <Typography component="small" color="textSecondary">
                  Help to generate different exchange transactions in ABT Wallet
                </Typography>
              </Typography>
              <div className="section__content">
                <Exchange {...session.value} receiveType="asset" payType="token" />
                <Exchange {...session.value} receiveType="token" payType="asset" />
                <Exchange {...session.value} receiveType="asset" payType="asset" />
                <Exchange {...session.value} receiveType="asset" receiveCount="2" payType="asset" />
                <Exchange {...session.value} receiveType="asset" payCount="2" payType="asset" />
                <Exchange
                  {...session.value}
                  receiveType="asset"
                  receiveCount="2"
                  payType="asset"
                  payCount="2"
                />
                <Exchange
                  {...session.value}
                  receiveType="token"
                  receiveCount="2"
                  payType="asset"
                  payCount="2"
                />
                <Exchange
                  {...session.value}
                  receiveType="asset"
                  receiveCount="5"
                  payType="token"
                  payCount="1"
                />
                <Exchange
                  {...session.value}
                  receiveCount="5"
                  receiveType="asset"
                  payCount="5"
                  payType="asset"
                />
                <Exchange
                  {...session.value}
                  receiveType="token"
                  receiveCount="10000000"
                  payType="asset"
                  payCount="1"
                />
                <Exchange
                  {...session.value}
                  receiveType="token"
                  receiveCount="1000000000"
                  payType="asset"
                  payCount="1"
                />
              </div>
            </section>
            <section className="section">
              <Typography
                component="h3"
                variant="h5"
                className="section__header"
                color="textPrimary"
                gutterBottom>
                DID Auth Claims{' '}
                <Typography component="small" color="textSecondary">
                  Help to test different DID Auth Claims in ABT Wallet
                </Typography>
              </Typography>
              <div className="section__content">
                <ProfileButton {...session.value} />
                <AgentButton {...session.value} />
                <ErrorButton {...session.value} />
                <Button
                  color="primary"
                  variant="contained"
                  size="large"
                  className="action"
                  disabled>
                  Consume A Ticket
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  size="large"
                  className="action"
                  disabled>
                  Acquire A Product
                </Button>
              </div>
            </section>
            <section className="section">
              <Typography
                component="h3"
                variant="h5"
                className="section__header"
                color="textPrimary"
                gutterBottom>
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
          </React.Fragment>
        )}
        {open && (
          <Auth
            responsive
            action="login"
            checkFn={api.get}
            onClose={() => setOpen(false)}
            onSuccess={onLogin}
            messages={{
              title: 'login',
              scan: 'Scan QR code with ABT Wallet',
              confirm: 'Confirm login on your ABT Wallet',
              success: 'You have successfully signed in!',
            }}
          />
        )}
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  margin: 80px 0 0;

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
