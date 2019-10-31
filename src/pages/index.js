/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import Button from '@arcblock/ux/lib/Button';
import WalletDownload from '@arcblock/ux/lib/Wallet/Download';
import Tag from '@arcblock/ux/lib/Tag';

import Layout from '../components/layout';

export default function IndexPage() {
  return (
    <Layout title="Home">
      <Main>
        <Typography component="h2" variant="h4" className="page-header" color="textPrimary">
          ABT Wallet Playground <Tag type="error">V2.0</Tag>
        </Typography>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Atomic Swap{' '}
            <Typography component="small" color="textSecondary">
              Show the full potential of cross-chain transactions.
            </Typography>
          </Typography>
          <div className="section__content">
            <Button color="secondary" variant="contained" size="large" className="action">
              Swap 1 Token for 1 Asset
            </Button>
            <Button color="secondary" variant="contained" size="large" className="action">
              Swap 1 Token for 2 Assets
            </Button>
            <Button color="secondary" variant="contained" size="large" className="action">
              Swap 1 Token for 3 Assets
            </Button>
            <Button color="primary" variant="contained" size="large" className="action">
              Swap a Certificate for 4.99 Token
            </Button>
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
            <Button color="primary" variant="contained" size="large" className="action">
              Claim A Coupon to Save 0.99 Token
            </Button>
            <Button color="secondary" variant="contained" size="large" className="action">
              Buy A Ticket with 1.99 Token
            </Button>
            <Button color="danger" variant="contained" size="large" className="action">
              Consume A Ticket
            </Button>
            <Button color="secondary" variant="contained" size="large" className="action">
              Buy A Certificate with 3.99 Token
            </Button>
            <Button color="secondary" variant="contained" size="large" className="action">
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
