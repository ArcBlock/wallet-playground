/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import Tag from '@arcblock/ux/lib/Tag';

import Layout from '../components/layout';
import { SessionContext } from '../../packages/did-playground/src/Action/session';
import PlaygroundAction from '../../packages/did-playground/src/Action';

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
              action="receive_foreign_token"
              className="action"
              buttonColor="danger"
              buttonVariant="contained"
              buttonRounded={false}
              amount="random"
              title={`Get Random ${assetToken.symbol}`}
            />
            <PlaygroundAction
              action="receive_foreign_token"
              className="action"
              buttonColor="danger"
              amount={10}
              title={`Get 10 ${assetToken.symbol}`}
            />
            <PlaygroundAction
              action="receive_local_token"
              className="action"
              amount="random"
              title={`Get Random ${token.symbol}`}
            />
            <PlaygroundAction
              action="receive_local_token"
              className="action"
              amount={9.99}
              title={`Get 9.99 ${token.symbol}`}
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
              action="exchange_to_foreign_token"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Buy 1 ${assetToken.symbol} with 5 ${token.symbol}`}
              exchangeRate={5}
            />
            <PlaygroundAction
              action="exchange_to_local_token"
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
            <PlaygroundAction
              action="send_foreign_token"
              className="action"
              buttonVariant="contained"
              amount={0.1}
              title={`Send 0.1 ${assetToken.symbol}`}
            />
            <PlaygroundAction
              action="send_local_token"
              className="action"
              buttonVariant="contained"
              amount={10}
              title={`Send 10 ${token.symbol}`}
            />
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
