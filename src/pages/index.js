/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import Tag from '@arcblock/ux/lib/Tag';

import Layout from '../components/layout';
import { SessionContext } from '../components/PlaygroundAction/session';
import PlaygroundAction from '../components/PlaygroundAction';

import TransferTokenOut from '../components/auth/transfer_token_out';
import TransferTokenIn from '../components/auth/transfer_token_in';

import { version } from '../../package.json';

// 临时 demo 的页面
export default function MiniPage() {
  const { session } = useContext(SessionContext);
  const { token, assetToken } = session;

  return (
    <Layout title="Home">
      <Main>
        <Typography component="h2" variant="h5" className="page-header" color="textPrimary">
          ABT Wallet Playground Mini<Tag type="success">V{version}</Tag>
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
            <PlaygroundAction
              action="recharge_foreign"
              className="action"
              buttonColor="danger"
              buttonVariant="contained"
              buttonRounded={false}
              buttonText={`Get ${assetToken.symbol}`}
              title={`Get ${assetToken.symbol}`}
            />
            <PlaygroundAction
              action="recharge_local"
              className="action"
              buttonVariant="contained"
              buttonText={`Get ${token.symbol}`}
              title={`Get ${token.symbol}`}
            />
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
            <PlaygroundAction
              action="exchange_to_foreign"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Buy 1 ${assetToken.symbol} with 5 ${token.symbol}`}
              exchangeRate={5}
            />
            <PlaygroundAction
              action="exchange_to_local"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Sell 1 ${assetToken.symbol} for 5 ${token.symbol}`}
              exchangeRate={5}
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
            <TransferTokenOut {...session} />
            <TransferTokenIn {...session} />
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
