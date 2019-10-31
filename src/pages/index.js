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

import FundButton from '../components/auth/fund';
import SwapBadgeButton from '../components/auth/swap_badge';
import SwapBadgesButton from '../components/auth/swap_badges';
import SwapTicketButton from '../components/auth/swap_ticket';
import SwapCertificateButton from '../components/auth/swap_certificate';

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
          ABT Wallet Playground <Tag type="error">V2.0</Tag>
        </Typography>
        {(session.loading || (session.value && !session.value.user)) && (
          <CircularProgress size={64} color="secondary" />
        )}
        {session.value && session.value.user && (
          <React.Fragment>
            <section className="section">
              <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
                Feeling lucky{' '}
                <Typography component="small" color="textSecondary">
                  Get your account funded for doing later testing
                </Typography>
              </Typography>
              <div className="section__content">
                <FundButton {...session.value} />
              </div>
            </section>
            <section className="section">
              <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
                Atomic Swap{' '}
                <Typography component="small" color="textSecondary">
                  Show the full potential of cross-chain transactions.
                </Typography>
              </Typography>
              <div className="section__content">
                <SwapBadgeButton {...session.value} />
                <SwapBadgesButton {...session.value} />
              </div>
            </section>
            <section className="section">
              <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
                Asset Factory{' '}
                <Typography component="small" color="textSecondary">
                  Show what dApps can do with asset that ABT Wallet understands.
                </Typography>
              </Typography>
              <div className="section__content">
                <SwapTicketButton {...session.value} />
                <SwapCertificateButton {...session.value} />
                <Button color="danger" variant="contained" size="large" className="action" disabled>
                  Consume A Ticket
                </Button>
                <Button color="primary" variant="contained" size="large" className="action" disabled>
                  Claim A Coupon to Save 0.99 Token
                </Button>
                <Button color="secondary" variant="contained" size="large" className="action" disabled>
                  Buy A Badge with 0.99 Token
                </Button>
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
